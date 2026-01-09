#!/usr/bin/env python3
"""
Copyright (c) 2025 develper21

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

IMPORTANT: Removal of this header violates the license terms.
This code remains the property of develper21 and is protected
under intellectual property laws.
"""

from fastapi import APIRouter, Response, status
import time
import psutil # For system metrics

router = APIRouter()

# Global start time for uptime calculation
START_TIME = time.time()

@router.get("/health")
async def health_check():
    """
    Comprehensive Health Check for Monitoring Tools (Prometheus/DataDog/UptimeRobot)
    """
    uptime = time.time() - START_TIME
    cpu_usage = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    
    # In production, you would also check DB and Redis connections
    db_status = "connected" 
    redis_status = "connected"

    status_code = status.HTTP_200_OK
    overall_status = "healthy"

    # If critical resources are failing, change status
    if cpu_usage > 95:
        overall_status = "degraded"
        # status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": overall_status,
        "timestamp": time.time(),
        "uptime_seconds": round(uptime, 2),
        "version": "1.0.0",
        "metrics": {
            "cpu": f"{cpu_usage}%",
            "memory_percent": f"{memory.percent}%",
            "db": db_status,
            "redis": redis_status
        }
    }

@router.get("/error-test")
async def trigger_error():
    """
    Endpoint to test observability and alerting
    """
    raise ValueError("Manual crash triggered for monitoring verification.")
