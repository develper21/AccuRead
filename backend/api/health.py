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
Health check endpoints for AccuRead Backend
"""

from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
import time
import psutil
from typing import Dict, Any

from models.meter import HealthResponse
from utils.auth import get_current_active_user
from models.user import User

router = APIRouter()

# Application start time for uptime calculation
start_time = time.time()

@router.get("/", response_model=HealthResponse)
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint
    """
    uptime = time.time() - start_time
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "uptime": uptime,
        "database_status": "connected",  # Mock status
        "redis_status": "connected"     # Mock status
    }

@router.get("/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """
    Detailed health check with system metrics
    """
    uptime = time.time() - start_time
    
    # System metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Mock service statuses
    services = {
        "database": {
            "status": "healthy",
            "response_time": 0.012,
            "connections": 5
        },
        "redis": {
            "status": "healthy", 
            "response_time": 0.003,
            "memory_usage": "45MB"
        },
        "ocr_engine": {
            "status": "healthy",
            "model_loaded": True,
            "gpu_available": True
        }
    }
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "uptime": uptime,
        "system": {
            "cpu_percent": cpu_percent,
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": (disk.used / disk.total) * 100
            }
        },
        "services": services,
        "api_endpoints": {
            "auth": "operational",
            "meter": "operational", 
            "health": "operational",
            "export": "operational"
        }
    }

@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    """
    Get application metrics for monitoring
    """
    uptime = time.time() - start_time
    
    return {
        "timestamp": datetime.now(),
        "uptime_seconds": uptime,
        "uptime_human": str(timedelta(seconds=int(uptime))),
        "system": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        },
        "application": {
            "active_connections": 12,  # Mock data
            "requests_per_minute": 45,  # Mock data
            "ocr_processing_time_avg": 2.3,  # Mock data
            "error_rate": 0.02  # Mock data
        },
        "endpoints": {
            "/health": {"calls": 1250, "avg_response": 0.001},
            "/api/v1/auth/login": {"calls": 45, "avg_response": 0.150},
            "/api/v1/meter/extract": {"calls": 78, "avg_response": 2.3},
            "/api/v1/meter/history": {"calls": 23, "avg_response": 0.045}
        }
    }

@router.get("/status")
async def get_status() -> Dict[str, Any]:
    """
    Get application status information
    """
    return {
        "application": "AccuRead Backend",
        "version": "1.0.0",
        "status": "running",
        "environment": "development",  # Could be from settings
        "timestamp": datetime.now(),
        "features": {
            "ocr_processing": True,
            "jwt_authentication": True,
            "rate_limiting": True,
            "file_upload": True,
            "data_export": True
        },
        "configuration": {
            "max_file_size": "10MB",
            "supported_formats": ["JPEG", "PNG", "BMP"],
            "rate_limits": {
                "default": "100/minute",
                "ocr": "30/minute",
                "auth": "5/5minutes"
            }
        }
    }
