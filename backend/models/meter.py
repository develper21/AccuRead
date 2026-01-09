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
Data models for AccuRead Backend
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    FIELD_WORKER = "field_worker"

class MeterType(str, Enum):
    DIGITAL = "digital"
    ANALOG = "analog"
    SMART = "smart"
    HYBRID = "hybrid"

# User Models
class UserBase(BaseModel):
    email: str = Field(..., email=True)
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    email: Optional[str] = Field(None, email=True)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Authentication Models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Meter Reading Models
class MeterReadingBase(BaseModel):
    serial_number: str = Field(..., min_length=5)
    meter_type: MeterType = MeterType.DIGITAL
    reading_kwh: Optional[float] = None
    reading_kvah: Optional[float] = None
    max_demand_kw: Optional[float] = None
    demand_kva: Optional[float] = None
    unit: str = "kWh"

class MeterReadingCreate(MeterReadingBase):
    image_path: str
    confidence_scores: Dict[str, float]
    location: Optional[Dict[str, float]] = None
    processed_by_ai: bool = True

class MeterReadingUpdate(BaseModel):
    reading_kwh: Optional[float] = None
    reading_kvah: Optional[float] = None
    max_demand_kw: Optional[float] = None
    demand_kva: Optional[float] = None
    is_verified: Optional[bool] = None

class MeterReading(MeterReadingBase):
    id: int
    user_id: int
    image_path: str
    confidence_scores: Dict[str, float]
    location: Optional[Dict[str, float]] = None
    is_verified: bool = False
    processed_by_ai: bool = True
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# OCR Processing Models
class OCRRequest(BaseModel):
    image_data: bytes
    meter_type: Optional[MeterType] = MeterType.DIGITAL
    confidence_threshold: Optional[float] = 0.8

class OCRResult(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    confidence: Optional[Dict[str, float]] = None
    error_message: Optional[str] = None
    processing_time: float

class ExtractedReading(BaseModel):
    serial_number: Optional[str] = None
    reading_kwh: Optional[float] = None
    reading_kvah: Optional[float] = None
    max_demand_kw: Optional[float] = None
    demand_kva: Optional[float] = None
    unit: str = "kWh"
    confidence: float
    timestamp: datetime

# API Response Models
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)

class ErrorResponse(BaseModel):
    success: bool = False
    error: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    uptime: float
    database_status: str
    redis_status: str

# Export Models
class ExportRequest(BaseModel):
    format: str = Field(..., pattern="^(csv|excel|pdf)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    user_id: Optional[int] = None
    meter_serial: Optional[str] = None

class ExportStatus(BaseModel):
    export_id: str
    status: str  # pending, processing, completed, failed
    progress: int  # 0-100
    download_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    file_size: Optional[int] = None

# Statistics Models
class ReadingStats(BaseModel):
    total_readings: int
    verified_readings: int
    average_confidence: float
    readings_by_type: Dict[str, int]
    daily_readings: List[Dict[str, Any]]
    top_meters: List[Dict[str, Any]]

class UserStats(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    users_by_role: Dict[str, int]
