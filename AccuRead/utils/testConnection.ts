/**
 * Test script to verify frontend-backend API connection
 */

import { meterAPI } from '../services/api';

export const testBackendConnection = async () => {
  console.log('🔍 Testing Backend Connection...');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResult = await meterAPI.healthCheck();
    console.log('✅ Health Check:', healthResult);
    
    // Test 2: Mock API Call
    console.log('2. Testing mock extract endpoint...');
    const mockResult = await meterAPI.mockExtractReading();
    console.log('✅ Mock API Response:', mockResult);
    
    // Test 3: Validate Response Structure
    console.log('3. Validating response structure...');
    const requiredFields = ['data', 'confidence', 'timestamp', 'processed'];
    const hasAllFields = requiredFields.every(field => mockResult.hasOwnProperty(field));
    
    if (hasAllFields) {
      console.log('✅ Response structure is valid');
    } else {
      console.log('❌ Response structure is invalid');
      return false;
    }
    
    // Test 4: Validate Data Structure
    console.log('4. Validating data structure...');
    const dataFields = ['serialNumber', 'kwh', 'kvah', 'maxDemandKw', 'demandKva'];
    const hasAllDataFields = dataFields.every(field => mockResult.data.hasOwnProperty(field));
    
    if (hasAllDataFields) {
      console.log('✅ Data structure is valid');
    } else {
      console.log('❌ Data structure is invalid');
      return false;
    }
    
    console.log('🎉 All backend connection tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

export const testEnvironmentConfig = () => {
  console.log('🔍 Testing Environment Configuration...');
  
  try {
    const Config = require('../config/env').default;
    
    console.log('API Base URL:', Config.api.baseUrl);
    console.log('API Timeout:', Config.api.timeout);
    console.log('API Retry Attempts:', Config.api.retryAttempts);
    
    // Check if API URL is properly configured
    if (Config.api.baseUrl && Config.api.baseUrl !== 'https://api.accuread.com') {
      console.log('✅ Environment configuration is using local backend');
    } else {
      console.log('⚠️ Environment configuration is using production URL');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Environment configuration test failed:', error);
    return false;
  }
};
