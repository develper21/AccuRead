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

import { MeterReadingResult } from '../types';
import { storageService } from './storage';
import api from './api';

/**
 * Sync Service
 * Implements Delta Sync Strategy to save battery and data.
 * Only uploads readings that haven't been synced yet.
 */

export const SyncService = {
    /**
     * Identifies "dirty" records and uploads them to the server.
     */
    syncPendingReadings: async (): Promise<{ success: number; failed: number }> => {
        console.log('[SyncService] Starting Delta Sync...');

        // 1. Fetch all local readings
        const allReadings = await storageService.getReadings();

        // 2. Filter readings that are NOT synced yet
        const pendingReadings = allReadings.filter(r => !r.isSynced);

        if (pendingReadings.length === 0) {
            console.log('[SyncService] No pending changes to sync.');
            return { success: 0, failed: 0 };
        }

        console.log(`[SyncService] Found ${pendingReadings.length} pending records.`);

        let successCount = 0;
        let failedCount = 0;

        // 3. Sequential Sync (Delta Strategy)
        for (const reading of pendingReadings) {
            try {
                // Use MeterReadingResult type for API call
                const readingResult: MeterReadingResult = {
                    data: reading.data,
                    confidence: reading.confidence || {
                        serialNumber: 0.9,
                        kwh: 0.95,
                        kvah: 0.8,
                        maxDemandKw: 0.85,
                        demandKva: 0.8,
                    },
                    timestamp: reading.timestamp,
                    imageUrl: reading.imageUrl,
                    processed: true,
                    isOffline: false,
                    tenantId: reading.tenantId || 'default-tenant',
                    lastModified: new Date().toISOString(),
                };

                // Use API service for actual sync
                await api.post('/readings/sync', readingResult);
                console.log(`[SyncService] Synced reading: ${readingResult.timestamp}`);

                // 4. Mark as synced locally
                reading.isSynced = true;
                successCount++;
            } catch (error) {
                console.error(`[SyncService] Failed to sync record: ${reading.timestamp}`, error);
                failedCount++;
                
                // Implement retry logic for failed syncs
                if (failedCount <= 3) {
                    console.log(`[SyncService] Retrying sync for ${reading.timestamp}`);
                    // Retry after delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    try {
                        await api.post('/readings/sync', {
                            data: reading.data,
                            timestamp: reading.timestamp,
                            imageUrl: reading.imageUrl,
                            tenantId: reading.tenantId || 'default-tenant',
                        });
                        reading.isSynced = true;
                        successCount++;
                        failedCount--; // Adjust failed count after retry success
                    } catch (retryError) {
                        console.error(`[SyncService] Retry failed for ${reading.timestamp}:`, retryError);
                    }
                }
            }
        }

        // 5. Bulk update storage with new sync status
        if (successCount > 0) {
            await storageService.updateAllReadings(allReadings);
        }

        console.log(`[SyncService] Sync Complete. Success: ${successCount}, Failed: ${failedCount}`);
        return { success: successCount, failed: failedCount };
    },

    /**
     * Sync a single reading immediately
     */
    syncSingleReading: async (reading: any): Promise<boolean> => {
        try {
            const readingResult: MeterReadingResult = {
                data: reading.data,
                confidence: reading.confidence || {
                    serialNumber: 0.9,
                    kwh: 0.95,
                    kvah: 0.8,
                    maxDemandKw: 0.85,
                    demandKva: 0.8,
                },
                timestamp: reading.timestamp,
                imageUrl: reading.imageUrl,
                processed: true,
                isOffline: false,
                tenantId: reading.tenantId || 'default-tenant',
                lastModified: new Date().toISOString(),
            };

            await api.post('/readings/sync', readingResult);
            
            // Mark as synced locally
            reading.isSynced = true;
            const allReadings = await storageService.getReadings();
            const updatedReadings = allReadings.map(r => 
                r.timestamp === reading.timestamp ? reading : r
            );
            await storageService.updateAllReadings(updatedReadings);
            
            console.log(`[SyncService] Single reading synced: ${readingResult.timestamp}`);
            return true;
        } catch (error) {
            console.error(`[SyncService] Failed to sync single reading:`, error);
            return false;
        }
    },

    /**
     * Get sync statistics
     */
    getSyncStats: async (): Promise<{
        total: number;
        synced: number;
        pending: number;
        lastSyncTime: string | null;
    }> => {
        const allReadings = await storageService.getReadings();
        const syncedReadings = allReadings.filter(r => r.isSynced);
        const pendingReadings = allReadings.filter(r => !r.isSynced);
        
        // Get last sync time from synced readings
        const lastSyncReading = syncedReadings
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        return {
            total: allReadings.length,
            synced: syncedReadings.length,
            pending: pendingReadings.length,
            lastSyncTime: lastSyncReading?.timestamp || null,
        };
    },

    /**
     * Force sync all readings (including already synced)
     */
    forceSyncAll: async (): Promise<{ success: number; failed: number }> => {
        console.log('[SyncService] Starting Force Sync...');
        
        const allReadings = await storageService.getReadings();
        let successCount = 0;
        let failedCount = 0;

        for (const reading of allReadings) {
            try {
                const readingResult: MeterReadingResult = {
                    data: reading.data,
                    confidence: reading.confidence || {
                        serialNumber: 0.9,
                        kwh: 0.95,
                        kvah: 0.8,
                        maxDemandKw: 0.85,
                        demandKva: 0.8,
                    },
                    timestamp: reading.timestamp,
                    imageUrl: reading.imageUrl,
                    processed: true,
                    isOffline: false,
                    tenantId: reading.tenantId || 'default-tenant',
                    lastModified: new Date().toISOString(),
                };

                await api.post('/readings/sync', readingResult);
                reading.isSynced = true;
                successCount++;
            } catch (error) {
                console.error(`[SyncService] Force sync failed for ${reading.timestamp}:`, error);
                failedCount++;
            }
        }

        if (successCount > 0) {
            await storageService.updateAllReadings(allReadings);
        }

        console.log(`[SyncService] Force Sync Complete. Success: ${successCount}, Failed: ${failedCount}`);
        return { success: successCount, failed: failedCount };
    },

    /**
     * Clean up old synced readings
     */
    cleanupOldReadings: async (olderThanDays: number = 30): Promise<number> => {
        const allReadings = await storageService.getReadings();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        
        const oldReadings = allReadings.filter(reading => {
            const readingDate = new Date(reading.timestamp);
            return reading.isSynced && readingDate < cutoffDate;
        });
        
        if (oldReadings.length > 0) {
            // Filter out old readings and update storage
            const allReadings = await storageService.getReadings();
            const filteredReadings = allReadings.filter(reading => {
                const readingDate = new Date(reading.timestamp);
                return !(reading.isSynced && readingDate < cutoffDate);
            });
            await storageService.updateAllReadings(filteredReadings);
            console.log(`[SyncService] Cleaned up ${oldReadings.length} old readings`);
        }
        
        return oldReadings.length;
    },
};
