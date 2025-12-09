import {useState, useCallback} from 'react';
import {meterAPI} from '../services/api';
import {MeterReadingResult} from '../types';

interface UseOCREngineReturn {
  processing: boolean;
  error: string | null;
  extractReading: (imageUri: string) => Promise<MeterReadingResult | null>;
  testMockAPI: () => Promise<MeterReadingResult | null>;
  checkBackendHealth: () => Promise<boolean>;
}

export const useOCREngine = (): UseOCREngineReturn => {
  const [processing, setProcessing] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const extractReading = useCallback(async (imageUri: string): Promise<MeterReadingResult | null> => {
    setProcessing(true);
    setErrorState(null);

    try {
      const result = await meterAPI.extractReading(imageUri);
      return result;
    } catch (err) {
      let errorMessage = 'Failed to extract meter reading';
      
      if (err instanceof Error) {
        if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
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
