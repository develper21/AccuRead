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

import os
from typing import Optional

class Settings:
    # App Configuration
    PROJECT_NAME: str = "AccuRead Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    
    # MongoDB Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/accuread")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "accuread")
    
    # JWT Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your_secret_key_change_in_production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
    JWT_REFRESH_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_EXPIRE_DAYS", "7"))
    
    # OCR Configuration
    OCR_MODEL_PATH: str = os.getenv("OCR_MODEL_PATH", "models/ocr")
    OCR_CONFIDENCE_THRESHOLD: float = float(os.getenv("OCR_CONFIDENCE_THRESHOLD", "0.8"))
    GPU_ENABLED: bool = os.getenv("GPU_ENABLED", "true").lower() == "true"
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = ["*"]  # In production, set specific origins
    
    # Rate Limiting Configuration
    DEFAULT_RATE_LIMIT: int = int(os.getenv("DEFAULT_RATE_LIMIT", "100"))  # requests per minute
    OCR_RATE_LIMIT: int = int(os.getenv("OCR_RATE_LIMIT", "30"))       # requests per minute
    AUTH_RATE_LIMIT: int = int(os.getenv("AUTH_RATE_LIMIT", "5"))       # requests per 5 minutes
    EXPORT_RATE_LIMIT: int = int(os.getenv("EXPORT_RATE_LIMIT", "3"))     # requests per 5 minutes
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", str(10 * 1024 * 1024)))  # 10MB
    ALLOWED_FILE_TYPES: list = ["image/jpeg", "image/png", "image/bmp"]

settings = Settings()
