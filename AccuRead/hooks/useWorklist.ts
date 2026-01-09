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

import { useState, useEffect, useCallback } from 'react';
import { worklistService } from '../services/worklistService';
import { WorklistItem, FieldAgentLocation, RouteOptimization, WorklistFilters } from '../types';
import { useLocation } from './useLocation';
import { useAuth } from './useAuth';

interface UseWorklistReturn {
  worklist: WorklistItem[];
  loading: boolean;
  error: string | null;
  routeOptimization: RouteOptimization | null;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    skipped: number;
    totalDistance: number;
    estimatedTime: number;
  };
  refreshWorklist: () => Promise<void>;
  updateItemStatus: (itemId: string, status: WorklistItem['status'], notes?: string) => Promise<void>;
  optimizeRoute: () => Promise<void>;
  filterWorklist: (filters: WorklistFilters) => void;
  clearFilters: () => void;
}

export const useWorklist = (): UseWorklistReturn => {
  const { user } = useAuth();
  const { location } = useLocation();
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [filteredWorklist, setFilteredWorklist] = useState<WorklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null);
  const [currentFilters, setCurrentFilters] = useState<WorklistFilters>({});

  const calculateStats = useCallback((items: WorklistItem[]) => {
    return worklistService.getWorklistStats(items);
  }, []);

  const refreshWorklist = useCallback(async () => {
    if (!user || !location) {
      setError('User authentication and location required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const agentLocation: FieldAgentLocation = {
        agentId: user.uid,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
        accuracy: 10, // Default accuracy
      };

      const nearbyMeters = await worklistService.getNearbyMeters(agentLocation, 3000); // 3km radius
      setWorklist(nearbyMeters);
      
      // Apply current filters
      if (Object.keys(currentFilters).length > 0) {
        const filtered = worklistService.filterWorklist(nearbyMeters, currentFilters);
        setFilteredWorklist(filtered);
      } else {
        setFilteredWorklist(nearbyMeters);
      }
      
      // Auto-optimize route
      const optimization = await worklistService.optimizeRoute(nearbyMeters);
      setRouteOptimization(optimization);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load worklist');
    } finally {
      setLoading(false);
    }
  }, [user, location, currentFilters]);

  const updateItemStatus = useCallback(async (
    itemId: string, 
    status: WorklistItem['status'], 
    notes?: string
  ) => {
    try {
      await worklistService.updateWorklistStatus(itemId, status, notes);
      
      // Update local state
      const updatedWorklist = worklist.map(item =>
        item.id === itemId 
          ? { 
              ...item, 
              status, 
              notes: notes || item.notes,
              completedDate: status === 'COMPLETED' ? new Date().toISOString() : item.completedDate
            }
          : item
      );
      
      setWorklist(updatedWorklist);
      
      // Reapply filters
      if (Object.keys(currentFilters).length > 0) {
        const filtered = worklistService.filterWorklist(updatedWorklist, currentFilters);
        setFilteredWorklist(filtered);
      } else {
        setFilteredWorklist(updatedWorklist);
      }
      
      // Re-optimize route if needed
      if (status === 'COMPLETED' || status === 'SKIPPED') {
        const remainingItems = updatedWorklist.filter(item => 
          item.status === 'PENDING' || item.status === 'IN_PROGRESS'
        );
        const optimization = await worklistService.optimizeRoute(remainingItems);
        setRouteOptimization(optimization);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  }, [worklist, currentFilters]);

  const optimizeRoute = useCallback(async () => {
    const itemsToOptimize = filteredWorklist.filter(item => 
      item.status === 'PENDING' || item.status === 'IN_PROGRESS'
    );
    
    try {
      const optimization = await worklistService.optimizeRoute(itemsToOptimize);
      setRouteOptimization(optimization);
    } catch (err: any) {
      setError(err.message || 'Failed to optimize route');
    }
  }, [filteredWorklist]);

  const filterWorklist = useCallback((filters: WorklistFilters) => {
    setCurrentFilters(filters);
    const filtered = worklistService.filterWorklist(worklist, filters);
    setFilteredWorklist(filtered);
  }, [worklist]);

  const clearFilters = useCallback(() => {
    setCurrentFilters({});
    setFilteredWorklist(worklist);
  }, [worklist]);

  // Auto-refresh when location changes
  useEffect(() => {
    if (location && user) {
      refreshWorklist();
    }
  }, [location, user]);

  const stats = calculateStats(filteredWorklist);

  return {
    worklist: filteredWorklist,
    loading,
    error,
    routeOptimization,
    stats,
    refreshWorklist,
    updateItemStatus,
    optimizeRoute,
    filterWorklist,
    clearFilters,
  };
};
