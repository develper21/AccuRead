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
Configuration settings for AccuRead Backend
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # App Configuration
    PROJECT_NAME: str = "AccuRead Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    
    # Database Configuration
    MONGODB_URL: str = "mongodb://localhost:27017/accuread"
    MONGODB_DB_NAME: str = "accuread"
    
    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    # Cache TTL Settings (in seconds)
    CACHE_TTL_USER: int = 3600      # 1 hour
    CACHE_TTL_READING: int = 1800   # 30 minutes
    CACHE_TTL_EXPORT: int = 7200    # 2 hours
    CACHE_TTL_STATS: int = 300      # 5 minutes
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "your_secret_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_EXPIRE_DAYS: int = 7
    
    # OCR Configuration
    OCR_MODEL_PATH: str = "models/ocr"
    OCR_CONFIDENCE_THRESHOLD: float = 0.8
    GPU_ENABLED: bool = True
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = ["*"]
    
    # Rate Limiting Configuration
    DEFAULT_RATE_LIMIT: int = 100  # requests per minute
    OCR_RATE_LIMIT: int = 30       # requests per minute
    AUTH_RATE_LIMIT: int = 5       # requests per 5 minutes
    EXPORT_RATE_LIMIT: int = 3     # requests per 5 minutes
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: list = ["image/jpeg", "image/png", "image/bmp"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
