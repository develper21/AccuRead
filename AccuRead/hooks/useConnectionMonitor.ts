/**
 * Connection status monitoring for frontend-backend communication
 */

import { useEffect, useState } from 'react';
import { meterAPI } from '../services/api';
import { testBackendConnection, testEnvironmentConfig } from '../utils/testConnection';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface ConnectionMetrics {
  status: ConnectionStatus;
  lastChecked: Date;
  responseTime?: number;
  errorCount: number;
  totalChecks: number;
}

export const useConnectionMonitor = (interval: number = 30000) => {
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    status: 'connecting',
    lastChecked: new Date(),
    errorCount: 0,
    totalChecks: 0,
  });

  const checkConnection = async () => {
    const startTime = Date.now();
    
    try {
      setMetrics(prev => ({ 
        ...prev, 
        status: 'connecting',
        totalChecks: prev.totalChecks + 1 
      }));

      const isConnected = await meterAPI.healthCheck();
      const responseTime = Date.now() - startTime;

      setMetrics(prev => ({
        ...prev,
        status: isConnected ? 'connected' : 'disconnected',
        lastChecked: new Date(),
        responseTime,
        errorCount: isConnected ? 0 : prev.errorCount + 1
      }));

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        status: 'error',
        lastChecked: new Date(),
        responseTime,
        errorCount: prev.errorCount + 1
      }));
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkConnection, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { metrics, checkConnection };
};

export const runConnectionDiagnostics = async () => {
  console.log('🔍 Running Full Connection Diagnostics...');
  
  const results = {
    environment: false,
    backend: false,
    api: false,
    timestamp: new Date(),
    details: {} as any
  };

  try {
    // Test 1: Environment Configuration
    console.log('1. Testing environment configuration...');
    results.environment = testEnvironmentConfig();
    results.details.environment = 'Environment config loaded';

    // Test 2: Backend Connection
    console.log('2. Testing backend connection...');
    results.backend = await testBackendConnection();
    results.details.backend = 'Backend API accessible';

    // Test 3: API Response Structure
    console.log('3. Testing API response structure...');
    const mockResponse = await meterAPI.mockExtractReading();
    results.api = !!mockResponse.data;
    results.details.api = 'API response structure valid';

    console.log('✅ Diagnostics completed:', results);
    return results;

  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
    results.details.error = error;
    return results;
  }
};
