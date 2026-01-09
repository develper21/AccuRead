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
Image processing utilities for AccuRead Backend
"""

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import io
from typing import Tuple, Optional

class ImageProcessor:
    """Advanced image processing for meter reading"""
    
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    
    def validate_image(self, image_path: str) -> bool:
        """
        Validate if image is suitable for OCR processing
        """
        try:
            # Check file extension
            if not any(image_path.lower().endswith(fmt) for fmt in self.supported_formats):
                return False
            
            # Try to open image
            with Image.open(image_path) as img:
                # Check minimum dimensions
                if img.width < 640 or img.height < 480:
                    return False
                
                # Check if image is not corrupted
                img.verify()
            
            return True
            
        except Exception:
            return False
    
    def enhance_image_quality(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance image quality for better OCR accuracy
        """
        # Convert PIL to OpenCV format if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply multiple enhancement techniques
        
        # 1. Noise reduction
        denoised = cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7, searchWindowSize=21)
        
        # 2. Contrast enhancement using CLAHE
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised)
        
        # 3. Sharpening
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(enhanced, -1, kernel)
        
        # 4. Gamma correction
        gamma = 1.2
        gamma_corrected = np.array(255 * (sharpened / 255) ** gamma, dtype=np.uint8)
        
        return gamma_corrected
    
    def remove_glare(self, image: np.ndarray) -> np.ndarray:
        """
        Remove glare and bright spots from image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Create a mask for bright areas
        _, bright_mask = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        
        # Inpaint the bright areas
        inpainted = cv2.inpaint(gray, bright_mask, 3, cv2.INPAINT_TELEA)
        
        return inpainted
    
    def correct_perspective(self, image: np.ndarray) -> np.ndarray:
        """
        Correct perspective distortion in meter images
        """
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Find edges
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Find the largest rectangular contour
        largest_contour = None
        max_area = 0
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > max_area:
                # Approximate contour
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                # Check if it's roughly rectangular
                if len(approx) == 4:
                    largest_contour = approx
                    max_area = area
        
        if largest_contour is not None:
            # Apply perspective transformation
            # Order points: top-left, top-right, bottom-right, bottom-left
            pts = largest_contour.reshape(4, 2)
            rect = self.order_points(pts)
            
            # Get the dimensions of the transformed image
            width_a = np.sqrt((rect[2][0] - rect[3][0])**2 + (rect[2][1] - rect[3][1])**2)
            width_b = np.sqrt((rect[1][0] - rect[0][0])**2 + (rect[1][1] - rect[0][1])**2)
            max_width = max(int(width_a), int(width_b))
            
            height_a = np.sqrt((rect[1][0] - rect[2][0])**2 + (rect[1][1] - rect[2][1])**2)
            height_b = np.sqrt((rect[0][0] - rect[3][0])**2 + (rect[0][1] - rect[3][1])**2)
            max_height = max(int(height_a), int(height_b))
            
            # Destination points
            dst = np.array([
                [0, 0],
                [max_width - 1, 0],
                [max_width - 1, max_height - 1],
                [0, max_height - 1]
            ], dtype="float32")
            
            # Apply perspective transform
            M = cv2.getPerspectiveTransform(rect, dst)
            warped = cv2.warpPerspective(image, M, (max_width, max_height))
            
            return warped
        
        return image
    
    def order_points(self, pts: np.ndarray) -> np.ndarray:
        """
        Order points in consistent order for perspective transform
        """
        # Initialize a list of coordinates that will be ordered
        rect = np.zeros((4, 2), dtype="float32")
        
        # Sum and difference of points
        s = pts.sum(axis=1)
        diff = np.diff(pts, axis=1)
        
        # Top-left point will have smallest sum
        rect[0] = pts[np.argmin(s)]
        # Bottom-right point will have largest sum
        rect[2] = pts[np.argmax(s)]
        # Top-right point will have smallest difference
        rect[1] = pts[np.argmin(diff)]
        # Bottom-left point will have largest difference
        rect[3] = pts[np.argmax(diff)]
        
        return rect
    
    def segment_display_region(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Segment the digital display region from meter image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply adaptive thresholding
        binary = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter for display-like regions
        display_regions = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 5000:  # Skip small regions
                continue
            
            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = w / h
            
            # Typical digital display characteristics
            if (2.0 <= aspect_ratio <= 6.0 and 
                w > 200 and h > 50 and 
                area > 10000):
                display_regions.append((area, x, y, w, h))
        
        if display_regions:
            # Sort by area and take the largest
            display_regions.sort(key=lambda x: x[0], reverse=True)
            _, x, y, w, h = display_regions[0]
            
            # Extract display region with some padding
            padding = 10
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(image.shape[1], x + w + padding)
            y2 = min(image.shape[0], y + h + padding)
            
            return image[y1:y2, x1:x2]
        
        return None
    
    def resize_for_ocr(self, image: np.ndarray, target_width: int = 800) -> np.ndarray:
        """
        Resize image to optimal dimensions for OCR
        """
        height, width = image.shape[:2]
        aspect_ratio = width / height
        
        new_width = target_width
        new_height = int(target_width / aspect_ratio)
        
        resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        return resized
    
    def process_for_ocr(self, image_path: str) -> Optional[np.ndarray]:
        """
        Complete processing pipeline for OCR
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return None
            
            # 1. Remove glare
            no_glare = self.remove_glare(image)
            
            # 2. Correct perspective
            corrected = self.correct_perspective(no_glare)
            
            # 3. Enhance quality
            enhanced = self.enhance_image_quality(corrected)
            
            # 4. Segment display region
            display_region = self.segment_display_region(enhanced)
            
            if display_region is not None:
                final_image = display_region
            else:
                final_image = enhanced
            
            # 5. Resize for optimal OCR
            final_image = self.resize_for_ocr(final_image)
            
            return final_image
            
        except Exception as e:
            print(f"Error processing image: {e}")
            return None

# Global image processor instance
image_processor = ImageProcessor()
