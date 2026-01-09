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

import { useState, useCallback } from 'react';
import { meterAPI } from '../services/api';
import { OnDeviceOcrService } from '../services/onDeviceOcrService';
import { MeterReadingResult, MeterTemplate } from '../types';

interface UseOCREngineReturn {
  processing: boolean;
  error: string | null;
  extractReading: (imageUri: string, template?: MeterTemplate) => Promise<MeterReadingResult | null>;
  testMockAPI: () => Promise<MeterReadingResult | null>;
  checkBackendHealth: () => Promise<boolean>;
}

export const useOCREngine = (): UseOCREngineReturn => {
  const [processing, setProcessing] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const extractReading = useCallback(async (imageUri: string, template?: MeterTemplate): Promise<MeterReadingResult | null> => {
    setProcessing(true);
    setErrorState(null);

    try {
      // 1. First, try Server-side OCR (Higher accuracy)
      console.log('[OCREngine] Attempting Server-side AI...');
      // Note: In real app, we would send template ID to server too
      const result = await meterAPI.extractReading(imageUri);
      return result;
    } catch (err) {
      console.warn('[OCREngine] Server AI failed or unreachable. Falling back to Edge AI (On-Device)...');

      // 2. Fallback to Edge AI (Local On-Device Processing)
      try {
        const localResult = await OnDeviceOcrService.processImage(imageUri, template);
        if (localResult) {
          console.log('[OCREngine] Edge AI Success! Processed locally.');

          // 3. Human-in-the-loop flag (Error Fallback)
          // Adjusting to 70% threshold as per Robust Infrastructure Phase 1
          const lowConfidence = Object.values(localResult.confidence).some(score => score < 70);
          if (lowConfidence) {
            localResult.requiresReview = true;
            console.warn('[OCREngine] Low confidence detected (< 70%). Flagged for Supervisor Review.');
          }

          return localResult;
        }
      } catch (localErr) {
        console.error('[OCREngine] Both Server and Edge AI failed:', localErr);
      }

      let errorMessage = 'Failed to extract meter reading';
      if (err instanceof Error) {
        if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Processed offline? (Check Edge AI status)';
        } else {
          errorMessage = err.message;
        }
      }

      setErrorState(errorMessage);
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  const testMockAPI = useCallback(async (): Promise<MeterReadingResult | null> => {
    setProcessing(true);
    setErrorState(null);

    try {
      const result = await meterAPI.mockExtractReading();
      return result;
    } catch {
      setErrorState('Failed to connect to backend');
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      const isHealthy = await meterAPI.healthCheck();
      if (!isHealthy) {
        setErrorState('Backend server is not responding');
      }
      return isHealthy;
    } catch {
      setErrorState('Cannot connect to backend server');
      return false;
    }
  }, []);

  return {
    processing,
    error: errorState,
    extractReading,
    testMockAPI,
    checkBackendHealth,
  };
};
