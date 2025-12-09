import cv2
import numpy as np
import re
from typing import Dict, Any, Optional
from paddleocr import PaddleOCR
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OCREngine:
    """
    OCR engine for extracting meter readings using PaddleOCR
    """
    
    def __init__(self):
        # Initialize PaddleOCR with English language
        self.ocr = PaddleOCR(
            use_angle_cls=True,
            lang='en',
            show_log=False,
            use_gpu=False  # Set to True if GPU is available
        )
        
        # Regex patterns for different meter fields
        self.patterns = {
            'serial_number': r'[A-Z0-9]{8,12}',  # Alphanumeric serial
            'kwh': r'\d{1,5}\.\d{1,2}',  # Decimal number for kWh
            'kvah': r'\d{1,5}\.\d{1,2}',  # Decimal number for kVAh
            'max_demand_kw': r'\d{1,3}\.\d{1,2}',  # Decimal for max demand
            'demand_kva': r'\d{1,3}\.\d{1,2}',  # Decimal for demand kVA
        }
        
        # Common labels to look for
        self.field_labels = {
            'serial_number': ['SERIAL', 'SNO', 'SERIAL NO', 'NO'],
            'kwh': ['kWh', 'KWH', 'ENERGY', 'TOTAL'],
            'kvah': ['kVAh', 'KVAH', 'APPARENT'],
            'max_demand_kw': ['MD', 'MAX DEMAND', 'DEMAND kW', 'MD kW'],
            'demand_kva': ['DEMAND kVA', 'DEMAND KVA']
        }
    
    def extract_meter_data(self, image: np.ndarray) -> Dict[str, str]:
        """
        Extract meter data from processed image
        
        Args:
            image: Preprocessed image as numpy array
            
        Returns:
            Dictionary with extracted field values
        """
        try:
            # Perform OCR
            results = self.ocr.ocr(image, cls=True)
            
            if not results or not results[0]:
                logger.warning("No text detected in image")
                return self._get_empty_result()
            
            # Extract text and positions
            text_data = []
            for line in results[0]:
                if line:
                    bbox, (text, confidence) = line
                    text_data.append({
                        'text': text.strip(),
                        'confidence': confidence,
                        'bbox': bbox
                    })
            
            # Filter low confidence results
            filtered_text = [item for item in text_data if item['confidence'] > 0.5]
            
            # Extract fields using patterns and context
            extracted_data = self._extract_fields(filtered_text)
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"Error in OCR extraction: {str(e)}")
            return self._get_empty_result()
    
    def _extract_fields(self, text_data: list) -> Dict[str, str]:
        """
        Extract specific fields from OCR text data
        """
        result = {}
        all_text = ' '.join([item['text'] for item in text_data])
        
        # Extract serial number
        result['serial_number'] = self._extract_serial_number(text_data, all_text)
        
        # Extract numeric values with context
        result['kwh'] = self._extract_numeric_field(text_data, all_text, 'kwh')
        result['kvah'] = self._extract_numeric_field(text_data, all_text, 'kvah')
        result['max_demand_kw'] = self._extract_numeric_field(text_data, all_text, 'max_demand_kw')
        result['demand_kva'] = self._extract_numeric_field(text_data, all_text, 'demand_kva')
        
        return result
    
    def _extract_serial_number(self, text_data: list, all_text: str) -> str:
        """
        Extract serial number using pattern matching
        """
        # Look for alphanumeric patterns
        for item in text_data:
            text = item['text']
            # Check if text matches serial pattern
            if re.match(self.patterns['serial_number'], text):
                return text
        
        # Try to find in combined text
        matches = re.findall(self.patterns['serial_number'], all_text)
        if matches:
            return matches[0]
        
        return ""
    
    def _extract_numeric_field(self, text_data: list, all_text: str, field_type: str) -> str:
        """
        Extract numeric field based on labels and patterns
        """
        # Look for field labels first
        labels = self.field_labels.get(field_type, [])
        
        for i, item in enumerate(text_data):
            text = item['text'].upper()
            
            # Check if this is a label
            if any(label in text for label in labels):
                # Look at next items for the value
                for j in range(i + 1, min(i + 3, len(text_data))):
                    next_item = text_data[j]
                    # Check if it matches numeric pattern
                    if re.match(self.patterns[field_type], next_item['text']):
                        return next_item['text']
        
        # Fallback: find all numeric patterns and return the most likely
        matches = re.findall(self.patterns[field_type], all_text)
        if matches:
            return matches[0]
        
        return ""
    
    def _get_empty_result(self) -> Dict[str, str]:
        """
        Return empty result structure
        """
        return {
            'serial_number': '',
            'kwh': '',
            'kvah': '',
            'max_demand_kw': '',
            'demand_kva': ''
        }
    
    def calculate_confidence(self, extracted_data: Dict[str, str]) -> Dict[str, float]:
        """
        Calculate confidence scores for extracted fields
        
        Args:
            extracted_data: Dictionary with extracted field values
            
        Returns:
            Dictionary with confidence scores (0-100)
        """
        confidence_scores = {}
        
        for field, value in extracted_data.items():
            if not value:
                confidence_scores[field] = 0.0
                continue
            
            # Base confidence on pattern matching
            pattern = self.patterns.get(field, '')
            if pattern and re.match(pattern, value):
                base_confidence = 90.0
            else:
                base_confidence = 60.0
            
            # Adjust based on field characteristics
            if field == 'serial_number':
                # Serial should be alphanumeric
                if any(c.isalpha() for c in value) and any(c.isdigit() for c in value):
                    base_confidence += 5
            elif field in ['kwh', 'kvah', 'max_demand_kw', 'demand_kva']:
                # These should be decimal numbers
                try:
                    float_value = float(value)
                    # Reasonable range checks
                    if field in ['kwh', 'kvah'] and 0 <= float_value <= 99999:
                        base_confidence += 5
                    elif field in ['max_demand_kw', 'demand_kva'] and 0 <= float_value <= 999:
                        base_confidence += 5
                except ValueError:
                    base_confidence -= 20
            
            confidence_scores[field] = min(100.0, max(0.0, base_confidence))
        
        return confidence_scores
    
    def mock_extract(self) -> Dict[str, str]:
        """
        Mock extraction for testing purposes
        """
        return {
            'serial_number': 'ABC123XYZ',
            'kwh': '1450.5',
            'kvah': '1823.2',
            'max_demand_kw': '85.6',
            'demand_kva': '92.1'
        }
    
    def mock_confidence(self) -> Dict[str, float]:
        """
        Mock confidence scores for testing purposes
        """
        return {
            'serial_number': 95.0,
            'kwh': 98.5,
            'kvah': 97.2,
            'max_demand_kw': 94.8,
            'demand_kva': 96.3
        }
