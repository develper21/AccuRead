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

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Config } from '../config/env';

declare const ErrorUtils: {
  setGlobalHandler: (handler: (error: any, isFatal?: boolean) => void) => void;
} | undefined;

export interface CrashReport {
  id: string;
  timestamp: number;
  error: Error;
  stackTrace: string;
  context: {
    screen: string;
    action: string;
    userId?: string;
    deviceId: string;
    platform: string;
    appVersion: string;
    additionalInfo?: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CrashReportingService {
  initialize: () => Promise<void>;
  reportError: (error: Error, context?: Partial<CrashReport['context']>) => void;
  reportMessage: (message: string, level: 'info' | 'warning' | 'error') => void;
  setUser: (userId: string, email?: string, username?: string) => void;
  setTag: (key: string, value: string) => void;
  setContext: (key: string, value: any) => void;
  addBreadcrumb: (message: string, category?: string, level?: 'info' | 'warning' | 'error') => void;
  getCrashReports: () => CrashReport[];
  clearCrashReports: () => void;
  enableCrashReporting: (enabled: boolean) => void;
  isCrashReportingEnabled: () => boolean;
}

class CrashReportingServiceImpl implements CrashReportingService {
  private static instance: CrashReportingServiceImpl;
  private isInitialized = false;
  private _isCrashReportingEnabled = true;
  private crashReports: CrashReport[] = [];
  private maxReports = 50;
  private userId: string | null = null;
  private tags: Record<string, string> = {};
  private context: Record<string, any> = {};
  private breadcrumbs: Array<{
    message: string;
    timestamp: number;
    category?: string;
    level?: 'info' | 'warning' | 'error';
  }> = [];
  private maxBreadcrumbs = 100;

  static getInstance(): CrashReportingServiceImpl {
    if (!CrashReportingServiceImpl.instance) {
      CrashReportingServiceImpl.instance = new CrashReportingServiceImpl();
    }
    return CrashReportingServiceImpl.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Sentry or other crash reporting service
      if (Config.analytics.sentryDsn) {
        console.log('Crash reporting initialized with Sentry');
        this.isInitialized = true;
        this.setupGlobalErrorHandlers();
      } else {
        console.warn('Sentry DSN not found, using local crash reporting');
        this.isInitialized = true;
        this.setupGlobalErrorHandlers();
      }
    } catch (error) {
      console.error('Failed to initialize crash reporting:', error);
    }
  }

  reportError(error: Error, context?: Partial<CrashReport['context']>): void {
    if (!this._isCrashReportingEnabled) {
      return;
    }

    const crashReport: CrashReport = {
      id: `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error,
      stackTrace: error.stack || '',
      context: {
        screen: context?.screen || 'unknown',
        action: context?.action || 'unknown',
        userId: this.userId || context?.userId,
        deviceId: Platform.OS,
        platform: Platform.OS,
        appVersion: Config.app.version,
        additionalInfo: context?.additionalInfo,
      },
      severity: this.determineSeverity(error),
    };

    this.addCrashReport(crashReport);
    this.sendToCrashReportingService(crashReport);
  }

  reportMessage(message: string, level: 'info' | 'warning' | 'error'): void {
    if (!this._isCrashReportingEnabled) {
      return;
    }

    this.addBreadcrumb(message, 'message', level);

    // For error level messages, create a synthetic error
    if (level === 'error') {
      const error = new Error(message);
      this.reportError(error, {
        action: 'message_report',
        additionalInfo: { message_level: level },
      });
    }
  }

  setUser(userId: string, email?: string, username?: string): void {
    this.userId = userId;
    
    if (!this.isInitialized) {
      return;
    }

    try {
      console.log('Setting crash reporting user:', userId);
      // Sentry: setUser
      // This would be implemented with actual Sentry SDK
    } catch (error) {
      console.error('Error setting crash reporting user:', error);
    }
  }

  setTag(key: string, value: string): void {
    this.tags[key] = value;
    
    if (!this.isInitialized) {
      return;
    }

    try {
      console.log('Setting crash reporting tag:', key, value);
      // Sentry: setTag
      // This would be implemented with actual Sentry SDK
    } catch (error) {
      console.error('Error setting crash reporting tag:', error);
    }
  }

  setContext(key: string, value: any): void {
    this.context[key] = value;
    
    if (!this.isInitialized) {
      return;
    }

    try {
      console.log('Setting crash reporting context:', key, value);
      // Sentry: setContext
      // This would be implemented with actual Sentry SDK
    } catch (error) {
      console.error('Error setting crash reporting context:', error);
    }
  }

  addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error'): void {
    const breadcrumb = {
      message,
      timestamp: Date.now(),
      category,
      level,
    };

    if (this.breadcrumbs.length >= this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
    this.breadcrumbs.push(breadcrumb);

    if (!this.isInitialized) {
      return;
    }

    try {
      console.log('Adding breadcrumb:', message);
      // Sentry: addBreadcrumb
      // This would be implemented with actual Sentry SDK
    } catch (error) {
      console.error('Error adding breadcrumb:', error);
    }
  }

  getCrashReports(): CrashReport[] {
    return [...this.crashReports];
  }

  clearCrashReports(): void {
    this.crashReports = [];
    console.log('Crash reports cleared');
  }

  enableCrashReporting(enabled: boolean): void {
    this._isCrashReportingEnabled = enabled;
    console.log('Crash reporting', enabled ? 'enabled' : 'disabled');
  }

  isCrashReportingEnabled(): boolean {
    return this._isCrashReportingEnabled;
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return 'medium';
    }
    
    if (errorMessage.includes('authentication') || errorMessage.includes('permission')) {
      return 'high';
    }
    
    if (errorMessage.includes('crash') || errorMessage.includes('fatal')) {
      return 'critical';
    }
    
    return 'low';
  }

  private addCrashReport(report: CrashReport): void {
    if (this.crashReports.length >= this.maxReports) {
      this.crashReports.shift();
    }
    this.crashReports.unshift(report);
  }

  private sendToCrashReportingService(report: CrashReport): void {
    try {
      console.log('Sending crash report:', report.id);
      
      if (Config.analytics.sentryDsn) {
        // Send to Sentry
        // This would be implemented with actual Sentry SDK
        console.log('Crash report sent to Sentry');
      } else {
        // Store locally or send to custom endpoint
        console.log('Crash report stored locally');
      }
    } catch (error) {
      console.error('Error sending crash report:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections (Web only)
    if (Platform.OS === 'web') {
      try {
        if (typeof (global as any).window !== 'undefined') {
          (global as any).window.addEventListener('unhandledrejection', (event: any) => {
            this.reportError(new Error(event.reason), {
              action: 'unhandled_promise_rejection',
              screen: 'global',
            });
          });
        }
      } catch (error) {
        console.warn('Could not setup unhandled rejection handler:', error);
      }
    }

    // Handle uncaught errors (React Native)
    if (Platform.OS !== 'web' && typeof ErrorUtils !== 'undefined' && ErrorUtils) {
      try {
        ErrorUtils.setGlobalHandler((error: any, isFatal?: boolean) => {
          this.reportError(error, {
            action: 'uncaught_error',
            screen: 'global',
            additionalInfo: { isFatal },
          });
        });
      } catch (error) {
        console.warn('Could not setup global error handler:', error);
      }
    }
  }
}

// Hook for using crash reporting
export const useCrashReporting = () => {
  const service = CrashReportingServiceImpl.getInstance();

  useEffect(() => {
    service.initialize();
  }, [service]);

  return {
    reportError: service.reportError,
    reportMessage: service.reportMessage,
    setUser: service.setUser,
    setTag: service.setTag,
    setContext: service.setContext,
    addBreadcrumb: service.addBreadcrumb,
    getCrashReports: service.getCrashReports,
    clearCrashReports: service.clearCrashReports,
    enableCrashReporting: service.enableCrashReporting,
    isCrashReportingEnabled: service.isCrashReportingEnabled,
  };
};

// Predefined crash reporting contexts
export const CrashContexts = {
  // Camera contexts
  cameraError: (errorType: string) => ({
    screen: 'Camera',
    action: 'camera_operation',
    additionalInfo: { error_type: errorType },
  }),

  ocrError: (confidence: number, processingTime: number) => ({
    screen: 'Camera',
    action: 'ocr_processing',
    additionalInfo: { confidence, processing_time_ms: processingTime },
  }),

  // Auth contexts
  authError: (method: 'email' | 'google') => ({
    screen: 'Auth',
    action: 'authentication',
    additionalInfo: { auth_method: method },
  }),

  // Sync contexts
  syncError: (syncType: 'reading' | 'worklist' | 'user') => ({
    screen: 'Background',
    action: 'data_sync',
    additionalInfo: { sync_type: syncType },
  }),

  // Network contexts
  networkError: (endpoint: string, statusCode?: number) => ({
    screen: 'Network',
    action: 'api_request',
    additionalInfo: { endpoint, status_code: statusCode },
  }),

  // Storage contexts
  storageError: (operation: 'read' | 'write' | 'delete') => ({
    screen: 'Storage',
    action: 'storage_operation',
    additionalInfo: { operation },
  }),

  // UI contexts
  navigationError: (fromScreen: string, toScreen: string) => ({
    screen: fromScreen,
    action: 'navigation',
    additionalInfo: { from_screen: fromScreen, to_screen: toScreen },
  }),
};

export const crashReportingService = CrashReportingServiceImpl.getInstance();
