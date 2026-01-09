#!/usr/bin/env python3
"""
Copyright (c) 2025 develper21

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

IMPORTANT: Removal of this header violates the license terms.
This code remains the property of develper21 and is protected
under intellectual property laws.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from middleware.rateLimiter import rate_limit_middleware
import uvicorn
import os
from typing import Dict, Any
import tempfile
import shutil
from datetime import datetime

# Import API routers
from api.auth import router as auth_router
from api.meter import router as meter_router
from api.health import router as health_router
from api.export import router as export_router

# Import configuration
from config.settings_simple import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered smart meter OCR system",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Rate Limiting Middleware
app.middleware("http")(rate_limit_middleware)

# Include API routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    meter_router,
    prefix=f"{settings.API_V1_STR}/meter",
    tags=["Meter Reading"]
)

app.include_router(
    export_router,
    prefix=f"{settings.API_V1_STR}/export",
    tags=["Data Export"]
)

app.include_router(
    health_router,
    tags=["Health Check"]
)

# Initialize OCR engine (commented out for now)
# ocr_engine = OCREngine()
# image_processor = ImageProcessor()

@app.get("/")
async def root():
    return {"message": "AccuRead API is running", "version": settings.VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/extract-meter-reading")
async def extract_meter_reading(image: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Extract meter reading from uploaded image (mock version for now)
    """
    
    # Validate file type
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Return mock data for now
    return {
        "data": {
            "serialNumber": "ABC123XYZ",
            "kwh": "1450.5",
            "kvah": "1823.2",
            "maxDemandKw": "85.6",
            "demandKva": "92.1"
        },
        "confidence": {
            "serialNumber": 95.0,
            "kwh": 98.5,
            "kvah": 97.2,
            "maxDemandKw": 94.8,
            "demandKva": 96.3
        },
        "timestamp": datetime.now().isoformat(),
        "processed": True
    }

@app.post("/mock-extract")
async def mock_extract_meter_reading(image: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Mock endpoint for testing frontend without actual OCR processing
    """
    return {
        "data": {
            "serialNumber": "ABC123XYZ",
            "kwh": "1450.5",
            "kvah": "1823.2",
            "maxDemandKw": "85.6",
            "demandKva": "92.1"
        },
        "confidence": {
            "serialNumber": 95.0,
            "kwh": 98.5,
            "kvah": 97.2,
            "maxDemandKw": 94.8,
            "demandKva": 96.3
        },
        "timestamp": datetime.now().isoformat(),
        "processed": True
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
