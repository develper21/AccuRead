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

import axios from 'axios';
import {MeterReadingResult} from '../types';
import Config from '../config/env';
import { APIErrorHandler } from '../utils/errorHandler';

const api = axios.create({
  baseURL: Config.api.baseUrl,
  timeout: Config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const meterAPI = {
  extractReading: async (imageUri: string): Promise<MeterReadingResult> => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'meter.jpg',
    } as any);

    try {
      const response = await api.post('/extract-meter-reading', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const apiError = APIErrorHandler.handleError(error);
      console.error('API Error:', apiError);
      throw new Error(APIErrorHandler.getErrorMessage(apiError));
    }
  },

  mockExtractReading: async (): Promise<MeterReadingResult> => {
    try {
      const response = await api.post('/mock-extract');
      return response.data;
    } catch (error) {
      const apiError = APIErrorHandler.handleError(error);
      console.error('Mock API Error:', apiError);
      throw new Error(APIErrorHandler.getErrorMessage(apiError));
    }
  },

  healthCheck: async (): Promise<boolean> => {
    try {
      await api.get('/health');
      return true;
    } catch (error) {
      const apiError = APIErrorHandler.handleError(error);
      console.error('Health Check Error:', apiError);
      
      // Don't throw for health check, just return false
      if (APIErrorHandler.isNetworkError(apiError)) {
        console.warn('Backend is not reachable');
      }
      return false;
    }
  },
};

export default api;
