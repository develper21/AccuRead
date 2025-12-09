import {useState, useCallback, useEffect} from 'react';
import {storageService} from '../services/storage';

interface UseOfflineModeReturn {
  isOnline: boolean;
  offlineQueue: string[];
  syncInProgress: boolean;
  addToQueue: (imageUri: string) => Promise<void>;
  syncOfflineData: () => Promise<void>;
  clearQueue: () => Promise<void>;
  queueCount: number;
}

export const useOfflineMode = (): UseOfflineModeReturn => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);

  const loadOfflineQueue = useCallback(async () => {
    try {
      const queue = await storageService.getOfflineQueue();
      setOfflineQueue(queue);
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }, []);

  // Monitor network status (mock implementation for now)
  useEffect(() => {
    // In a real app, you would use NetInfo here
    // For now, we'll assume online
    setIsOnline(true);
  }, []);

  // Load offline queue on mount
  useEffect(() => {
    loadOfflineQueue();
  }, [loadOfflineQueue]);

  const addToQueue = useCallback(async (imageUri: string): Promise<void> => {
    try {
      await storageService.addToOfflineQueue(imageUri);
      await loadOfflineQueue();
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
    }
  }, [loadOfflineQueue]);

  const syncOfflineData = useCallback(async (): Promise<void> => {
    if (!isOnline || offlineQueue.length === 0) {
      return;
    }

    setSyncInProgress(true);

    try {
      // Here you would implement the actual sync logic
      // For now, we'll just clear the queue as an example
      console.log('Syncing offline data...', offlineQueue);
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear the queue after successful sync
      await storageService.clearOfflineQueue();
      await loadOfflineQueue();
      
      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, offlineQueue, loadOfflineQueue]);

  const clearQueue = useCallback(async (): Promise<void> => {
    try {
      await storageService.clearOfflineQueue();
      await loadOfflineQueue();
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  }, [loadOfflineQueue]);

  return {
    isOnline,
    offlineQueue,
    syncInProgress,
    addToQueue,
    syncOfflineData,
    clearQueue,
    queueCount: offlineQueue.length,
  };
};
