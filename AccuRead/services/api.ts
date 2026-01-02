import axios from 'axios';
import {MeterReadingResult} from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
      console.error('API Error:', error);
      throw new Error('Failed to extract meter reading');
    }
  },

  mockExtractReading: async (): Promise<MeterReadingResult> => {
    try {
      const response = await api.post('/mock-extract');
      return response.data;
    } catch (error) {
      console.error('Mock API Error:', error);
      throw new Error('Failed to get mock reading');
    }
  },

  healthCheck: async (): Promise<boolean> => {
    try {
      await api.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default api;
