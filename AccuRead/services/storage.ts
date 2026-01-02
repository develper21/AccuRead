import AsyncStorage from '@react-native-async-storage/async-storage';
import {MeterReadingResult} from '../types';

const STORAGE_KEYS = {
  READINGS: '@accuread_readings',
  OFFLINE_QUEUE: '@accuread_offline_queue',
  USER_SETTINGS: '@accuread_settings',
};

export const storageService = {
  // Save reading locally
  saveReading: async (reading: MeterReadingResult): Promise<void> => {
    try {
      const existingReadings = await storageService.getReadings();
      const updatedReadings = [...existingReadings, reading];
      await AsyncStorage.setItem(
        STORAGE_KEYS.READINGS,
        JSON.stringify(updatedReadings),
      );
    } catch (error) {
      console.error('Error saving reading:', error);
      throw error;
    }
  },

  // Get all readings
  getReadings: async (): Promise<MeterReadingResult[]> => {
    try {
      const readings = await AsyncStorage.getItem(STORAGE_KEYS.READINGS);
      return readings ? JSON.parse(readings) : [];
    } catch (error) {
      console.error('Error getting readings:', error);
      return [];
    }
  },

  // Get all readings for dashboard
  async getAllReadings(): Promise<MeterReadingResult[]> {
    try {
      const stored = await AsyncStorage.getItem('meter_readings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting all readings:', error);
      return [];
    }
  },

  // Add to offline queue
  addToOfflineQueue: async (imageUri: string): Promise<void> => {
    try {
      const queue = await storageService.getOfflineQueue();
      const updatedQueue = [...queue, imageUri];
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(updatedQueue),
      );
    } catch (error) {
      console.error('Error adding to offline queue:', error);
      throw error;
    }
  },

  // Get offline queue
  getOfflineQueue: async (): Promise<string[]> => {
    try {
      const queue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  },

  // Clear offline queue
  clearOfflineQueue: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (error) {
      console.error('Error clearing offline queue:', error);
      throw error;
    }
  },

  // Clear all data
  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.READINGS,
        STORAGE_KEYS.OFFLINE_QUEUE,
        STORAGE_KEYS.USER_SETTINGS,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};
