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

import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {MeterReadingResult} from '../types';
import {storageService} from '../services/storage';

interface UseMeterReadingsReturn {
  readings: MeterReadingResult[];
  loading: boolean;
  error: string | null;
  loadReadings: () => Promise<void>;
  saveReading: (reading: MeterReadingResult) => Promise<boolean>;
  clearAllReadings: () => Promise<boolean>;
  deleteReading: (timestamp: string) => Promise<boolean>;
}

export const useMeterReadings = (): UseMeterReadingsReturn => {
  const [readings, setReadings] = useState<MeterReadingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReadings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const savedReadings = await storageService.getReadings();
      setReadings(savedReadings.reverse()); // Latest first
    } catch (err) {
      setError('Failed to load readings');
      console.error('Load readings error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReading = useCallback(async (reading: MeterReadingResult): Promise<boolean> => {
    try {
      await storageService.saveReading(reading);
      await loadReadings(); // Refresh list
      return true;
    } catch (err) {
      setError('Failed to save reading');
      console.error('Save reading error:', err);
      return false;
    }
  }, [loadReadings]);

  const clearAllReadings = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Clear All Readings',
        'Are you sure you want to delete all meter readings?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Delete All',
            style: 'destructive',
            onPress: async () => {
              try {
                await storageService.clearAllData();
                setReadings([]);
                resolve(true);
              } catch (err) {
                setError('Failed to clear readings');
                console.error('Clear readings error:', err);
                resolve(false);
              }
            },
          },
        ],
      );
    });
  }, []);

  const deleteReading = useCallback(async (timestamp: string): Promise<boolean> => {
    try {
      const updatedReadings = readings.filter(r => r.timestamp !== timestamp);
      await storageService.saveReading(updatedReadings[0]);
      setReadings(updatedReadings);
      return true;
    } catch (err) {
      setError('Failed to delete reading');
      console.error('Delete reading error:', err);
      return false;
    }
  }, [readings]);

  return {
    readings,
    loading,
    error,
    loadReadings,
    saveReading,
    clearAllReadings,
    deleteReading,
  };
};
