/**
 * Copyright (c) 2025 develper21
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * IMPORTANT: Removal of this header violates the license terms.
 * This code remains the property of develper21 and is protected
 * under intellectual property laws.
 */

import type { Frame } from 'react-native-vision-camera';

// Blur Detection Worklet
export const blurDetectionWorklet = (frame: Frame): { isBlurred: boolean; sharpness: number } => {
  'worklet';
  
  try {
    // Get frame dimensions
    const width = frame.width;
    const height = frame.height;
    
    // Get frame buffer data using toArrayBuffer()
    const buffer = frame.toArrayBuffer();
    const data = new Uint8Array(buffer);
    
    // Convert to grayscale if needed (assuming RGBA format)
    const grayscale = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4; // RGBA
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    // Laplacian variance for blur detection
    let laplacianSum = 0;
    let laplacianSumSquares = 0;
    const pixelCount = (width - 2) * (height - 2);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Laplacian kernel: [0 -1 0; -1 4 -1; 0 -1 0]
        const laplacian = 
          -grayscale[idx - width] - grayscale[idx - 1] + 4 * grayscale[idx] - 
          grayscale[idx + 1] - grayscale[idx + width];
        
        laplacianSum += laplacian;
        laplacianSumSquares += laplacian * laplacian;
      }
    }
    
    const mean = laplacianSum / pixelCount;
    const variance = (laplacianSumSquares / pixelCount) - (mean * mean);
    const sharpness = Math.sqrt(variance);
    
    // Threshold for blur detection (empirically determined)
    const isBlurred = sharpness < 100;
    
    return {
      isBlurred,
      sharpness: Math.min(255, Math.round(sharpness * 2.55)) // Normalize to 0-255
    };
  } catch (error) {
    console.error('Blur detection error:', error);
    return {
      isBlurred: false,
      sharpness: 100
    };
  }
};

// Glare Detection Worklet
export const glareDetectionWorklet = (frame: Frame): { hasGlare: boolean; brightness: number } => {
  'worklet';
  
  try {
    const width = frame.width;
    const height = frame.height;
    const buffer = frame.toArrayBuffer();
    const data = new Uint8Array(buffer);
    
    let totalBrightness = 0;
    let maxBrightness = 0;
    let saturatedPixels = 0;
    const totalPixels = width * height;
    
    // Analyze brightness and saturation
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4; // RGBA
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Calculate perceived brightness
      const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      totalBrightness += brightness;
      maxBrightness = Math.max(maxBrightness, brightness);
      
      // Count saturated pixels (near white)
      if (brightness > 240) {
        saturatedPixels++;
      }
    }
    
    const avgBrightness = totalBrightness / totalPixels;
    const saturationRatio = saturatedPixels / totalPixels;
    
    // Glare detection: high brightness + many saturated pixels
    const hasGlare = avgBrightness > 200 && saturationRatio > 0.05;
    
    return {
      hasGlare,
      brightness: Math.round(avgBrightness)
    };
  } catch (error) {
    console.error('Glare detection error:', error);
    return {
      hasGlare: false,
      brightness: 100
    };
  }
};

// Alignment Detection Worklet (simplified edge detection)
export const alignmentDetectionWorklet = (frame: Frame): { isAligned: boolean; confidence: number } => {
  'worklet';
  
  try {
    const width = frame.width;
    const height = frame.height;
    const buffer = frame.toArrayBuffer();
    const data = new Uint8Array(buffer);
    
    // Convert to grayscale
    const grayscale = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    // Simple edge detection using Sobel operator
    let edgeStrength = 0;
    let edgeCount = 0;
    
    // Focus on center region (where meter should be)
    const startX = Math.floor(width * 0.25);
    const endX = Math.floor(width * 0.75);
    const startY = Math.floor(height * 0.25);
    const endY = Math.floor(height * 0.75);
    
    for (let y = startY + 1; y < endY - 1; y++) {
      for (let x = startX + 1; x < endX - 1; x++) {
        const idx = y * width + x;
        
        // Sobel X
        const sobelX = 
          -grayscale[idx - width - 1] + grayscale[idx - width + 1] +
          -2 * grayscale[idx - 1] + 2 * grayscale[idx + 1] +
          -grayscale[idx + width - 1] + grayscale[idx + width + 1];
        
        // Sobel Y
        const sobelY = 
          -grayscale[idx - width - 1] - 2 * grayscale[idx - width] - grayscale[idx - width + 1] +
          grayscale[idx + width - 1] + 2 * grayscale[idx + width] + grayscale[idx + width + 1];
        
        const magnitude = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
        
        if (magnitude > 50) { // Edge threshold
          edgeStrength += magnitude;
          edgeCount++;
        }
      }
    }
    
    const avgEdgeStrength = edgeCount > 0 ? edgeStrength / edgeCount : 0;
    const edgeDensity = edgeCount / ((endX - startX) * (endY - startY));
    
    // Alignment confidence based on edge density and strength
    const confidence = Math.min(1.0, (avgEdgeStrength / 100) * (edgeDensity * 10));
    const isAligned = confidence > 0.3;
    
    return {
      isAligned,
      confidence: Math.round(confidence * 100)
    };
  } catch (error) {
    console.error('Alignment detection error:', error);
    return {
      isAligned: false,
      confidence: 0
    };
  }
};

// Combined Quality Analysis Worklet
export const qualityAnalysisWorklet = (frame: Frame) => {
  'worklet';
  
  const blurResult = blurDetectionWorklet(frame);
  const glareResult = glareDetectionWorklet(frame);
  const alignmentResult = alignmentDetectionWorklet(frame);
  
  return {
    ...blurResult,
    ...glareResult,
    ...alignmentResult,
    timestamp: Date.now()
  };
};
