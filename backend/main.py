from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import Dict, Any
import tempfile
import shutil
from datetime import datetime

from ocr_engine import OCREngine
from utils import ImageProcessor

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

# Initialize OCR engine
ocr_engine = OCREngine()
image_processor = ImageProcessor()

@app.get("/")
async def root():
    return {"message": "AccuRead API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/extract-meter-reading")
async def extract_meter_reading(image: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Extract meter reading from uploaded image
    
    Args:
        image: UploadFile containing the meter image
        
    Returns:
        JSON response with extracted data and confidence scores
    """
    
    # Validate file type
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
        shutil.copyfileobj(image.file, temp_file)
        temp_path = temp_file.name
    
    try:
        # Process image
        processed_image = image_processor.preprocess_image(temp_path)
        
        # Extract text using OCR
        extracted_data = ocr_engine.extract_meter_data(processed_image)
        
        # Calculate confidence scores
        confidence_scores = ocr_engine.calculate_confidence(extracted_data)
        
        # Format response
        response = {
            "data": {
                "serialNumber": extracted_data.get("serial_number", ""),
                "kwh": extracted_data.get("kwh", ""),
                "kvah": extracted_data.get("kvah", ""),
                "maxDemandKw": extracted_data.get("max_demand_kw", ""),
                "demandKva": extracted_data.get("demand_kva", "")
            },
            "confidence": {
                "serialNumber": confidence_scores.get("serial_number", 0.0),
                "kwh": confidence_scores.get("kwh", 0.0),
                "kvah": confidence_scores.get("kvah", 0.0),
                "maxDemandKw": confidence_scores.get("max_demand_kw", 0.0),
                "demandKva": confidence_scores.get("demand_kva", 0.0)
            },
            "timestamp": datetime.now().isoformat(),
            "processed": True
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)

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
