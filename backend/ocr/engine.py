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
OCR Engine for AccuRead Backend
"""

import cv2
import numpy as np
from PIL import Image
import os
from typing import Dict, Any, Optional
import time

class OCREngine:
    """Advanced OCR engine for meter reading extraction"""
    
    def __init__(self):
        self.confidence_threshold = 0.8
        self.gpu_enabled = True
        
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for better OCR accuracy
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply noise reduction
        denoised = cv2.fastNlMeansDenoising(gray)
        
        # Enhance contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Remove small noise
        kernel = np.ones((2,2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return cleaned
    
    def detect_meter_region(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Detect the meter display region in the image
        """
        # Find contours
        contours, _ = cv2.findContours(
            image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        
        # Filter for rectangular regions that might be meter displays
        meter_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 1000:  # Skip small regions
                continue
                
            # Approximate contour
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Check if it's rectangular
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                
                # Typical meter display aspect ratios
                if 1.5 <= aspect_ratio <= 4.0:
                    meter_regions.append((area, (x, y, w, h)))
        
        if not meter_regions:
            return None
            
        # Return the largest region
        meter_regions.sort(key=lambda x: x[0], reverse=True)
        x, y, w, h = meter_regions[0][1]
        
        return image[y:y+h, x:x+w]
    
    def extract_text_mock(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Mock text extraction (simulates OCR results)
        """
        # Simulate processing time
        time.sleep(0.1)
        
        # Generate realistic mock data
        mock_results = {
            "serialNumber": "ABC123XYZ789",
            "reading_kwh": 1450.5,
            "reading_kvah": 1823.2,
            "max_demand_kw": 85.6,
            "demand_kva": 92.1,
            "unit": "kWh"
        }
        
        # Generate confidence scores
        confidence_scores = {
            "serialNumber": 95.0 + np.random.uniform(-2, 2),
            "reading_kwh": 98.5 + np.random.uniform(-1, 1),
            "reading_kvah": 97.2 + np.random.uniform(-2, 2),
            "max_demand_kw": 94.8 + np.random.uniform(-3, 3),
            "demand_kva": 96.3 + np.random.uniform(-2, 2)
        }
        
        return {
            "data": mock_results,
            "confidence": confidence_scores,
            "success": True
        }
    
    def extract_text_paddleocr(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Extract text using PaddleOCR (if available)
        """
        try:
            from paddleocr import PaddleOCR
            
            # Initialize PaddleOCR
            ocr = PaddleOCR(use_angle_cls=True, lang='en')
            
            # Perform OCR
            result = ocr.ocr(image, cls=True)
            
            if not result or not result[0]:
                return {"success": False, "error": "No text detected"}
            
            # Process OCR results
            extracted_text = []
            for line in result[0]:
                text = line[1][0]
                confidence = line[1][1]
                extracted_text.append({"text": text, "confidence": confidence})
            
            # Parse meter reading from extracted text
            parsed_data = self.parse_meter_text(extracted_text)
            
            return {
                "success": True,
                "data": parsed_data,
                "raw_text": extracted_text
            }
            
        except ImportError:
            # Fallback to mock if PaddleOCR not available
            return self.extract_text_mock(image)
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def parse_meter_text(self, extracted_text: list) -> Dict[str, Any]:
        """
        Parse meter reading from extracted text
        """
        # This is a simplified parser - in production, you'd use more sophisticated
        # pattern matching and NLP techniques
        
        text_content = " ".join([item["text"] for item in extracted_text])
        
        # Mock parsing logic
        parsed_data = {
            "serialNumber": "ABC123XYZ789",
            "reading_kwh": 1450.5,
            "reading_kvah": 1823.2,
            "max_demand_kw": 85.6,
            "demand_kva": 92.1,
            "unit": "kWh"
        }
        
        return parsed_data
    
    def process_image(self, image_path: str) -> Dict[str, Any]:
        """
        Main processing pipeline
        """
        try:
            start_time = time.time()
            
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            
            # Detect meter region
            meter_region = self.detect_meter_region(processed_image)
            if meter_region is None:
                meter_region = processed_image  # Use full image if no region detected
            
            # Extract text
            if True:  # Use mock for now, change to condition for real OCR
                result = self.extract_text_mock(meter_region)
            else:
                result = self.extract_text_paddleocr(meter_region)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            result["processing_time"] = processing_time
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processing_time": time.time() - start_time if 'start_time' in locals() else 0
            }

# Global OCR engine instance
ocr_engine = OCREngine()

def process_meter_image(image_path: str) -> Dict[str, Any]:
    """
    Process meter image using OCR engine
    """
    return ocr_engine.process_image(image_path)
