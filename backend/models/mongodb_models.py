#!/usr/bin/env python3
"""
Copyright (c) 2025 develper21

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

IMPORTANT: Removal of this header violates the license terms.
This code remains the property of develper21 and is protected
under intellectual property laws.
"""

"""
MongoDB models for AccuRead Backend using Beanie ODM
"""

from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field, EmailStr, validator
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    FIELD_WORKER = "field_worker"

class MeterType(str, Enum):
    DIGITAL = "digital"
    ANALOG = "analog"
    SMART = "smart"
    HYBRID = "hybrid"

class ExportStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Location model for geospatial data
class Location(Document):
    coordinates: List[float] = Field(..., description="[longitude, latitude]")
    type: str = Field(default="Point", description="GeoJSON type")
    
    class Settings:
        indexes = [
            [("coordinates", "2dsphere")]  # Geospatial index
        ]

# User Document
class User(Document):
    email: Indexed(EmailStr, unique=True)  # Unique email index
    username: Indexed(str, unique=True)    # Unique username index
    full_name: Optional[str] = None
    hashed_password: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships (references)
    meter_reading_count: int = Field(default=0)
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "username",
            "created_at",
            "role",
            [("role", 1), ("is_active", 1)]  # Compound index
        ]
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        return v
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

# Meter Reading Document
class MeterReading(Document):
    user_id: Indexed(PydanticObjectId)  # Reference to User
    serial_number: Indexed(str)         # Meter serial number index
    meter_type: MeterType = MeterType.DIGITAL
    
    # Reading values
    reading_kwh: Optional[float] = None
    reading_kvah: Optional[float] = None
    max_demand_kw: Optional[float] = None
    demand_kva: Optional[float] = None
    unit: str = "kWh"
    
    # Media and processing
    image_path: str
    image_size: Optional[int] = None  # File size in bytes
    confidence_scores: Dict[str, float] = Field(default_factory=dict)
    processed_by_ai: bool = True
    
    # Location data
    location: Optional[Dict[str, Any]] = None  # {"lat": 28.6139, "lng": 77.2090}
    location_coordinates: Optional[List[float]] = None  # [longitude, latitude] for geospatial queries
    
    # Verification and status
    is_verified: bool = False
    verified_by: Optional[PydanticObjectId] = None  # Reference to User who verified
    verification_notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    reading_date: Optional[datetime] = None  # Actual meter reading date
    
    # Metadata
    device_info: Optional[Dict[str, Any]] = None  # Device used for capture
    processing_time: Optional[float] = None  # OCR processing time in seconds
    
    class Settings:
        name = "meter_readings"
        indexes = [
            "user_id",
            "serial_number",
            "created_at",
            "reading_date",
            "is_verified",
            "meter_type",
            [("user_id", 1), ("created_at", -1)],  # Compound: user's readings by date
            [("serial_number", 1), ("created_at", -1)],  # Compound: meter readings by date
            [("location_coordinates", "2dsphere")]  # Geospatial index
        ]
    
    @validator('confidence_scores')
    def validate_confidence_scores(cls, v):
        if v and any(score < 0 or score > 1 for score in v.values()):
            raise ValueError('Confidence scores must be between 0 and 1')
        return v
    
    def __repr__(self):
        return f"<MeterReading(id={self.id}, serial='{self.serial_number}', user_id={self.user_id})>"

# Export Job Document
class ExportJob(Document):
    export_id: Indexed(str, unique=True)  # Unique export identifier
    user_id: Indexed(PydanticObjectId)    # Reference to User
    
    # Export configuration
    format: str  # csv, excel, pdf
    filters: Dict[str, Any] = Field(default_factory=dict)  # Export filters
    
    # Status tracking
    status: ExportStatus = ExportStatus.PENDING
    progress: int = Field(default=0, ge=0, le=100)  # Progress percentage
    
    # File information
    file_path: Optional[str] = None
    file_size: Optional[int] = None  # File size in bytes
    download_url: Optional[str] = None
    
    # Processing details
    total_records: Optional[int] = None
    processed_records: int = Field(default=0)
    error_message: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Metadata
    expires_at: Optional[datetime] = None  # File expiration time
    download_count: int = Field(default=0)
    
    class Settings:
        name = "export_jobs"
        indexes = [
            "export_id",
            "user_id",
            "status",
            "created_at",
            "expires_at",
            [("user_id", 1), ("created_at", -1)],  # User's exports by date
            [("status", 1), ("created_at", -1)]   # Status by date for cleanup
        ]
    
    @validator('format')
    def validate_format(cls, v):
        if v not in ['csv', 'excel', 'pdf']:
            raise ValueError('Format must be csv, excel, or pdf')
        return v
    
    def __repr__(self):
        return f"<ExportJob(id={self.id}, export_id='{self.export_id}', status='{self.status}')>"

# Analytics/Statistics Document (for caching aggregated data)
class ReadingStats(Document):
    date: Indexed(datetime)  # Date for which stats are calculated
    total_readings: int = 0
    verified_readings: int = 0
    average_confidence: float = 0.0
    readings_by_type: Dict[str, int] = Field(default_factory=dict)
    readings_by_user: Dict[str, int] = Field(default_factory=dict)
    top_meters: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Geographic distribution
    readings_by_region: Dict[str, int] = Field(default_factory=dict)
    
    # Performance metrics
    average_processing_time: float = 0.0
    total_processing_time: float = 0.0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "reading_stats"
        indexes = [
            "date",
            [("date", -1)]  # Latest stats first
        ]
    
    def __repr__(self):
        return f"<ReadingStats(date={self.date}, total_readings={self.total_readings})>"

# System Configuration Document
class SystemConfig(Document):
    key: Indexed(str, unique=True)
    value: Any
    description: Optional[str] = None
    category: str = "general"
    is_public: bool = False  # Whether this config can be exposed to clients
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "system_config"
        indexes = [
            "key",
            "category",
            [("category", 1), ("key", 1)]
        ]
    
    def __repr__(self):
        return f"<SystemConfig(key='{self.key}', category='{self.category}')>"
