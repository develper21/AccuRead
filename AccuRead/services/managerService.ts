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

import { ActivityLog, UserProfile, UserRole, MeterReadingResult } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Audit & RBAC Service
 * 1. Tracks every action taken by agents (Audit Logs).
 * 2. Manages user roles and permissions (RBAC).
 */

const STORAGE_KEYS = {
    LOGS: '@accuread_audit_logs',
    USER_ROLE: '@accuread_user_role'
};

export const ManagerService = {
    // --- AUDIT LOGS ---
    logAction: async (action: string, user: UserProfile, metadata: any = {}) => {
        const newLog: ActivityLog = {
            id: Math.random().toString(36).substr(2, 9),
            action,
            timestamp: new Date().toISOString(),
            userId: user.uid,
            userName: user.name,
            metadata
        };

        try {
            const logs = await ManagerService.getLogs();
            const updatedLogs = [newLog, ...logs].slice(0, 500); // Keep last 500
            await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
            console.log(`[AuditLog] ${action} by ${user.name}`);
        } catch (e) {
            console.error('Failed to save audit log', e);
        }
    },

    getLogs: async (): Promise<ActivityLog[]> => {
        const logs = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
        return logs ? JSON.parse(logs) : [];
    },

    // --- RBAC (Role Based Access Control) ---
    setUserRole: async (role: UserRole) => {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    },

    getUserRole: async (): Promise<UserRole> => {
        const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
        return (role as UserRole) || 'FIELD_WORKER';
    },

    canPerform: (role: UserRole, action: 'DELETE' | 'EXPORT' | 'REVIEW' | 'SCAN'): boolean => {
        const permissions: Record<UserRole, string[]> = {
            'ADMIN': ['DELETE', 'EXPORT', 'REVIEW', 'SCAN'],
            'SUPERVISOR': ['EXPORT', 'REVIEW', 'SCAN'],
            'FIELD_WORKER': ['SCAN']
        };
        return permissions[role].includes(action);
    },

    // --- OBSERVABILITY & MONITORING (Production Grade) ---
    trackError: (error: any, context: string, severity: 'FATAL' | 'WARNING' = 'WARNING') => {
        const timestamp = new Date().toISOString();
        const errorPayload = {
            timestamp,
            context,
            severity,
            message: error?.message || 'Unknown Error',
            stack: error?.stack,
            deviceInfo: Platform.OS, // Mocked device info
        };

        console.error(`[Observability] [${severity}] Error in ${context}:`, errorPayload);

        // In Production: 
        // 1. Sentry.captureException(error);
        // 2. FirebaseCrashlytics.recordError(error);

        // Internal Audit Log for Manager Dashboard
        ManagerService.logAction('SYSTEM_ERROR', {
            uid: 'system',
            name: 'Error Monitor',
            email: 'system@accuread.com',
            role: 'ADMIN'
        }, errorPayload);
    },

    logEvent: (eventName: string, params: Record<string, any> = {}) => {
        console.log(`[Analytics/Event] ${eventName}`, params);
        // In Production: 
        // analytics().logEvent(eventName, params);
    },

    recordMetadata: async (key: string, value: string) => {
        // Track breadcrumbs or state for crash debugging
        console.log(`[Breadcrumb] ${key}: ${value}`);
    },

    // Calculate dashboard statistics
    calculateStats: (readings: MeterReadingResult[]) => {
        const totalReadings = readings.length;
        
        // For demo purposes, assume 70% edge, 30% cloud
        const edgeReadings = Math.round(totalReadings * 0.7);
        const cloudReadings = totalReadings - edgeReadings;
        
        // Calculate average confidence
        const averageConfidence = readings.reduce((sum, reading) => {
            const confidenceValues = Object.values(reading.confidence);
            const avgConfidence = confidenceValues.reduce((a: number, b: number) => a + b, 0) / confidenceValues.length;
            return sum + avgConfidence;
        }, 0) / totalReadings;

        // Count pending reviews (low confidence readings)
        const pendingReview = readings.filter(reading => {
            const confidenceValues = Object.values(reading.confidence);
            const avgConfidence = confidenceValues.reduce((a: number, b: number) => a + b, 0) / confidenceValues.length;
            return avgConfidence < 70; // Threshold for review
        }).length;

        // For demo purposes, estimate tamper alerts
        const tamperAlerts = Math.round(totalReadings * 0.05);

        return {
            totalReadings,
            edgeReadings,
            cloudReadings,
            pendingReview,
            tamperAlerts,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
        };
    },
};
