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

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Config } from '../config/env';

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp?: number;
  userId?: string;
}

export interface AnalyticsService {
  initialize: () => Promise<void>;
  logEvent: (event: AnalyticsEvent) => void;
  setUserProperty: (name: string, value: string) => void;
  setUserId: (userId: string) => void;
  logScreenView: (screenName: string, parameters?: Record<string, any>) => void;
  logError: (error: Error, context?: string) => void;
  logPerformance: (metric: string, value: number, unit?: string) => void;
  enableAnalytics: (enabled: boolean) => void;
  isAnalyticsEnabled: () => boolean;
}

class AnalyticsServiceImpl implements AnalyticsService {
  private static instance: AnalyticsServiceImpl;
  private isInitialized = false;
  private _isAnalyticsEnabled = true;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private maxQueueSize = 100;
  private performanceMetrics: Record<string, number[]> = {};

  static getInstance(): AnalyticsServiceImpl {
    if (!AnalyticsServiceImpl.instance) {
      AnalyticsServiceImpl.instance = new AnalyticsServiceImpl();
    }
    return AnalyticsServiceImpl.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Firebase Analytics
      if (Config.firebase.measurementId) {
        console.log('Firebase Analytics initialized');
        this.isInitialized = true;
        this.flushEventQueue();
      } else {
        console.warn('Firebase Analytics measurement ID not found');
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  logEvent(event: AnalyticsEvent): void {
    if (!this._isAnalyticsEnabled) {
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      userId: this.userId || undefined,
    };

    if (this.isInitialized) {
      this.sendEvent(fullEvent);
    } else {
      this.queueEvent(fullEvent);
    }
  }

  setUserProperty(name: string, value: string): void {
    if (!this._isAnalyticsEnabled || !this.isInitialized) {
      return;
    }

    try {
      console.log('Setting user property:', name, value);
    } catch (error) {
      console.error('Error setting user property:', error);
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
    
    if (!this._isAnalyticsEnabled || !this.isInitialized) {
      return;
    }

    try {
      console.log('Setting user ID:', userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  logScreenView(screenName: string, parameters?: Record<string, any>): void {
    this.logEvent({
      name: 'screen_view',
      parameters: {
        screen_name: screenName,
        platform: Platform.OS,
        ...parameters,
      },
    });
  }

  logError(error: Error, context?: string): void {
    this.logEvent({
      name: 'error',
      parameters: {
        error_message: error.message,
        error_stack: error.stack,
        context: context || 'unknown',
        platform: Platform.OS,
      },
    });
  }

  logPerformance(metric: string, value: number, unit = 'ms'): void {
    // Track performance metrics for analysis
    if (!this.performanceMetrics[metric]) {
      this.performanceMetrics[metric] = [];
    }
    this.performanceMetrics[metric].push(value);
    
    // Keep only last 100 metrics per type
    if (this.performanceMetrics[metric].length > 100) {
      this.performanceMetrics[metric] = this.performanceMetrics[metric].slice(-100);
    }

    this.logEvent({
      name: 'performance_metric',
      parameters: {
        metric_name: metric,
        metric_value: value,
        metric_unit: unit,
        platform: Platform.OS,
        average: this.calculateAverage(metric),
      },
    });
  }

  // Calculate average performance for a metric
  private calculateAverage(metric: string): number {
    const values = this.performanceMetrics[metric];
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Get performance statistics
  getPerformanceStats(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    Object.entries(this.performanceMetrics).forEach(([metric, values]) => {
      if (values.length > 0) {
        stats[metric] = {
          avg: this.calculateAverage(metric),
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });
    
    return stats;
  }

  enableAnalytics(enabled: boolean): void {
    this._isAnalyticsEnabled = enabled;
    console.log('Analytics', enabled ? 'enabled' : 'disabled');
  }

  isAnalyticsEnabled(): boolean {
    return this._isAnalyticsEnabled;
  }

  private sendEvent(event: AnalyticsEvent): void {
    try {
      console.log('Analytics event:', event.name, event.parameters);
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }

  private queueEvent(event: AnalyticsEvent): void {
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.eventQueue.shift();
    }
    this.eventQueue.push(event);
  }

  private flushEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }
}

// Hook for using analytics
export const useAnalytics = () => {
  const service = AnalyticsServiceImpl.getInstance();
  const serviceRef = useRef(service);
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (!isInitializedRef.current) {
      serviceRef.current.initialize();
      isInitializedRef.current = true;
    }
  }, [serviceRef]);

  // Enhanced logEvent with queue management
  const logEventWithQueue = (event: AnalyticsEvent) => {
    if (!serviceRef.current.isAnalyticsEnabled()) {
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Add to queue ref for tracking
    eventQueueRef.current.push(fullEvent);
    
    // Keep queue size manageable
    if (eventQueueRef.current.length > 50) {
      eventQueueRef.current = eventQueueRef.current.slice(-50);
    }

    serviceRef.current.logEvent(fullEvent);
  };

  // Get recent events from queue
  const getRecentEvents = (count: number = 10) => {
    return eventQueueRef.current.slice(-count);
  };

  return {
    logEvent: logEventWithQueue,
    setUserProperty: service.setUserProperty,
    setUserId: service.setUserId,
    logScreenView: service.logScreenView,
    logError: service.logError,
    logPerformance: service.logPerformance,
    enableAnalytics: service.enableAnalytics,
    isAnalyticsEnabled: service.isAnalyticsEnabled,
    getRecentEvents,
  };
};

export const analyticsService = AnalyticsServiceImpl.getInstance();
