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

import { MeterLocation, WorklistItem, RouteOptimization, FieldAgentLocation, WorklistFilters, MeterReadingResult } from '../types';
import { GeofencingService } from './geofencingService';

class WorklistService {
  private static instance: WorklistService;
  private worklistCache: Map<string, WorklistItem[]> = new Map();

  static getInstance(): WorklistService {
    if (!WorklistService.instance) {
      WorklistService.instance = new WorklistService();
    }
    return WorklistService.instance;
  }

  // Generate mock meter data for demonstration
  private generateMockMeters(centerLat: number, centerLng: number, radius: number = 3000): MeterLocation[] {
    const meters: MeterLocation[] = [];
    const priorities: MeterLocation['priority'][] = ['HIGH', 'MEDIUM', 'LOW'];
    const statuses: MeterLocation['status'][] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'];
    
    for (let i = 0; i < 20; i++) {
      // Generate random coordinates within radius
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius;
      const lat = centerLat + (distance * Math.cos(angle)) / 111320;
      const lng = centerLng + (distance * Math.sin(angle)) / (111320 * Math.cos(centerLat * Math.PI / 180));
      
      meters.push({
        meterId: `MTR-${String(i + 1).padStart(6, '0')}`,
        consumerName: `Consumer ${i + 1}`,
        address: `Address ${i + 1}, Sector ${Math.floor(Math.random() * 20) + 1}, Delhi`,
        latitude: lat,
        longitude: lng,
        meterNumber: `MT${1000 + i}`,
        consumerNumber: `CNS${2000 + i}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        estimatedReading: `${Math.floor(Math.random() * 1000) + 100}`,
        lastReadingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        assignedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes: `Notes for meter ${i + 1}`,
      });
    }
    
    return meters;
  }

  // Get nearby meters for a field agent
  async getNearbyMeters(
    agentLocation: FieldAgentLocation,
    radius: number = 3000
  ): Promise<WorklistItem[]> {
    try {
      const mockMeters = this.generateMockMeters(agentLocation.latitude, agentLocation.longitude, radius);
      
      const worklistItems: WorklistItem[] = mockMeters.map(meter => {
        const distance = GeofencingService.calculateDistance(
          agentLocation.latitude,
          agentLocation.longitude,
          meter.latitude,
          meter.longitude
        );
        
        return {
          id: `WL-${meter.meterId}`,
          meter,
          distance,
          estimatedTime: Math.ceil(distance / 50), // Assuming 50m/minute walking speed
          status: meter.status,
          assignedTo: agentLocation.agentId,
          assignedDate: meter.assignedDate,
          dueDate: meter.dueDate,
          notes: meter.notes,
        };
      });
      
      // Sort by distance
      worklistItems.sort((a, b) => a.distance - b.distance);
      
      // Cache the worklist
      this.worklistCache.set(agentLocation.agentId, worklistItems);
      
      return worklistItems;
    } catch (error) {
      console.error('Error getting nearby meters:', error);
      throw new Error('Failed to fetch nearby meters');
    }
  }

  // Optimize route for meter reading sequence
  async optimizeRoute(worklistItems: WorklistItem[]): Promise<RouteOptimization> {
    try {
      if (worklistItems.length === 0) {
        return {
          totalDistance: 0,
          estimatedTime: 0,
          optimizedSequence: [],
          waypoints: [],
        };
      }

      // Simple nearest neighbor algorithm for route optimization
      const unvisited = [...worklistItems];
      const optimizedSequence: string[] = [];
      const waypoints: RouteOptimization['waypoints'] = [];
      let totalDistance = 0;
      let currentLocation = unvisited[0]; // Start from nearest meter
      
      // Remove first meter and add to sequence
      const firstMeter = unvisited.shift()!;
      optimizedSequence.push(firstMeter.meter.meterId);
      waypoints.push({
        meterId: firstMeter.meter.meterId,
        coordinates: {
          latitude: firstMeter.meter.latitude,
          longitude: firstMeter.meter.longitude,
        },
        order: 0,
        distanceFromPrevious: 0,
      });

      // Find nearest unvisited meter repeatedly
      while (unvisited.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        for (let i = 0; i < unvisited.length; i++) {
          const distance = GeofencingService.calculateDistance(
            currentLocation.meter.latitude,
            currentLocation.meter.longitude,
            unvisited[i].meter.latitude,
            unvisited[i].meter.longitude
          );
          
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
          }
        }
        
        const nearestMeter = unvisited.splice(nearestIndex, 1)[0];
        currentLocation = nearestMeter;
        
        optimizedSequence.push(nearestMeter.meter.meterId);
        waypoints.push({
          meterId: nearestMeter.meter.meterId,
          coordinates: {
            latitude: nearestMeter.meter.latitude,
            longitude: nearestMeter.meter.longitude,
          },
          order: waypoints.length,
          distanceFromPrevious: nearestDistance,
        });
        
        totalDistance += nearestDistance;
      }

      const estimatedTime = Math.ceil(totalDistance / 50); // Assuming 50m/minute
      
      return {
        totalDistance,
        estimatedTime,
        optimizedSequence,
        waypoints,
      };
    } catch (error) {
      console.error('Error optimizing route:', error);
      throw new Error('Failed to optimize route');
    }
  }

  // Update worklist item status
  async updateWorklistStatus(
    worklistItemId: string,
    status: WorklistItem['status'],
    notes?: string,
    readingData?: MeterReadingResult
  ): Promise<void> {
    try {
      // Find and update the worklist item in cache
      for (const [agentId, worklist] of this.worklistCache.entries()) {
        const item = worklist.find(item => item.id === worklistItemId);
        if (item) {
          item.status = status;
          if (notes) item.notes = notes;
          if (readingData) item.readingData = readingData;
          if (status === 'COMPLETED') {
            item.completedDate = new Date().toISOString();
          }
          break;
        }
      }
      
      // In a real app, this would sync with the backend
      console.log(`Updated worklist item ${worklistItemId} to status: ${status}`);
    } catch (error) {
      console.error('Error updating worklist status:', error);
      throw new Error('Failed to update worklist status');
    }
  }

  // Filter worklist items
  filterWorklist(worklistItems: WorklistItem[], filters: WorklistFilters): WorklistItem[] {
    return worklistItems.filter(item => {
      if (filters.status && !filters.status.includes(item.status)) {
        return false;
      }
      
      if (filters.priority && !filters.priority.includes(item.meter.priority)) {
        return false;
      }
      
      if (filters.distanceRange) {
        if (item.distance < filters.distanceRange.min || item.distance > filters.distanceRange.max) {
          return false;
        }
      }
      
      if (filters.dateRange) {
        const itemDate = new Date(item.dueDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Get cached worklist for an agent
  getCachedWorklist(agentId: string): WorklistItem[] {
    return this.worklistCache.get(agentId) || [];
  }

  // Get worklist statistics
  getWorklistStats(worklistItems: WorklistItem[]): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    skipped: number;
    totalDistance: number;
    estimatedTime: number;
  } {
    const stats = {
      total: worklistItems.length,
      pending: worklistItems.filter(item => item.status === 'PENDING').length,
      inProgress: worklistItems.filter(item => item.status === 'IN_PROGRESS').length,
      completed: worklistItems.filter(item => item.status === 'COMPLETED').length,
      skipped: worklistItems.filter(item => item.status === 'SKIPPED').length,
      totalDistance: worklistItems.reduce((sum, item) => sum + item.distance, 0),
      estimatedTime: worklistItems.reduce((sum, item) => sum + item.estimatedTime, 0),
    };
    
    return stats;
  }
}

export const worklistService = WorklistService.getInstance();
