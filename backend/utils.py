import cv2
import numpy as np
from PIL import Image, ImageEnhance
import os
from typing import Tuple, Optional

class ImageProcessor:
    """
    Image processing utilities for meter reading OCR
    """
    
    def __init__(self):
        self.target_size = (800, 600)  # Standard size for processing
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for OCR
        
        Args:
            image_path: Path to the input image
            
        Returns:
            Processed image as numpy array
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        # Resize image
        image = cv2.resize(image, self.target_size)
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Remove noise
        denoised = cv2.medianBlur(thresh, 3)
        
        # Enhance contrast
        enhanced = self._enhance_contrast(denoised)
        
        return enhanced
    
    def _enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance image contrast using CLAHE
        """
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(image)
    
    def detect_display_region(self, image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """
        Detect the LCD display region in the meter image
        
        Args:
            image: Input image
            
        Returns:
            Bounding box coordinates (x, y, width, height) or None
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours by aspect ratio and area
        display_contours = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = w / h
            
            # Look for rectangular regions with aspect ratio typical of LCD displays
            if 2.0 <= aspect_ratio <= 4.0 and w > 100 and h > 50:
                display_contours.append((x, y, w, h))
        
        # Return the largest contour
        if display_contours:
            return max(display_contours, key=lambda x: x[2] * x[3])
        
        return None
    
    def crop_display_region(self, image: np.ndarray) -> np.ndarray:
        """
        Crop the display region from the meter image
        """
        bbox = self.detect_display_region(image)
        if bbox:
            x, y, w, h = bbox
            return image[y:y+h, x:x+w]
        
        # If no display region detected, return center crop
        height, width = image.shape[:2]
        center_x, center_y = width // 2, height // 2
        crop_size = min(width, height) // 2
        
        return image[
            center_y - crop_size//2:center_y + crop_size//2,
            center_x - crop_size//2:center_x + crop_size//2
        ]
    
    def check_image_quality(self, image: np.ndarray) -> dict:
        """
        Check image quality metrics
        
        Returns:
            Dictionary with quality metrics
        """
        # Calculate sharpness using Laplacian variance
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Calculate brightness
        brightness = np.mean(gray)
        
        # Check for glare (very bright spots)
        glare_threshold = 240
        glare_pixels = np.sum(gray > glare_threshold)
        glare_percentage = (glare_pixels / gray.size) * 100
        
        return {
            "sharpness": float(laplacian_var),
            "brightness": float(brightness),
            "glare_percentage": float(glare_percentage),
            "is_blurry": laplacian_var < 100,  # Threshold for blur detection
            "has_glare": glare_percentage > 5,  # Threshold for glare detection
            "is_well_lit": 50 <= brightness <= 200  # Good lighting range
        }
