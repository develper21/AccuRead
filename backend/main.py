from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from typing import Dict, Any
import tempfile
import shutil
from datetime import datetime

app = FastAPI(
    title="AccuRead API",
    description="AI-powered smart meter OCR system",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OCR engine (commented out for now)
# ocr_engine = OCREngine()
# image_processor = ImageProcessor()

@app.get("/")
async def root():
    return {"message": "AccuRead API is running"}

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
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
