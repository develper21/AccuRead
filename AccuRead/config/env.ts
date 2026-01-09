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

import Constants from 'expo-constants';

// Environment configuration service
export const Config = {
  // Firebase Configuration
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain || '',
    projectId: process.env.FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebaseProjectId || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId || '',
    appId: process.env.FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || Constants.expoConfig?.extra?.firebaseMeasurementId || '',
  },

  // Google Sign-In Configuration
  googleSignIn: {
    iosClientId: process.env.GOOGLE_SIGN_IN_IOS_CLIENT_ID || Constants.expoConfig?.extra?.googleSignInIosClientId || '',
    androidClientId: process.env.GOOGLE_SIGN_IN_ANDROID_CLIENT_ID || Constants.expoConfig?.extra?.googleSignInAndroidClientId || '',
    webClientId: process.env.GOOGLE_SIGN_IN_WEB_CLIENT_ID || Constants.expoConfig?.extra?.googleSignInWebClientId || '',
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.accuread.com',
    timeout: parseInt(process.env.API_TIMEOUT || Constants.expoConfig?.extra?.apiTimeout || '30000'),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || Constants.expoConfig?.extra?.apiRetryAttempts || '3'),
  },

  // AWS S3 Configuration
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || Constants.expoConfig?.extra?.awsAccessKeyId || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || Constants.expoConfig?.extra?.awsSecretAccessKey || '',
    region: process.env.AWS_REGION || Constants.expoConfig?.extra?.awsRegion || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || Constants.expoConfig?.extra?.awsS3Bucket || '',
  },

  // Azure Storage Configuration
  azure: {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || Constants.expoConfig?.extra?.azureStorageAccountName || '',
    accessKey: process.env.AZURE_STORAGE_ACCESS_KEY || Constants.expoConfig?.extra?.azureStorageAccessKey || '',
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || Constants.expoConfig?.extra?.azureStorageContainerName || '',
  },

  // Analytics Configuration
  analytics: {
    sentryDsn: process.env.SENTRY_DSN || Constants.expoConfig?.extra?.sentryDsn || '',
    amplitudeApiKey: process.env.AMPLITUDE_API_KEY || Constants.expoConfig?.extra?.amplitudeApiKey || '',
  },

  // Development Configuration
  development: {
    nodeEnv: process.env.NODE_ENV || Constants.expoConfig?.extra?.nodeEnv || 'development',
    debug: process.env.DEBUG || Constants.expoConfig?.extra?.debug || 'accuread:*',
    logLevel: process.env.LOG_LEVEL || Constants.expoConfig?.extra?.logLevel || 'debug',
  },

  // App Configuration
  app: {
    name: Constants.expoConfig?.name || 'AccuReadMobile',
    version: Constants.expoConfig?.version || '1.0.0',
    scheme: Constants.expoConfig?.scheme || 'accureadmobile',
  },

  // Helper methods
  isDevelopment: () => {
    return Constants.expoConfig?.extra?.nodeEnv === 'development' || process.env.NODE_ENV === 'development';
  },

  isProduction: () => {
    return Constants.expoConfig?.extra?.nodeEnv === 'production' || process.env.NODE_ENV === 'production';
  },

  getFirebaseConfig: () => {
    const config = Config.firebase;
    if (!config.apiKey) {
      console.warn('Firebase API key not found. Please check your environment variables.');
    }
    return config;
  },

  getGoogleSignInConfig: () => {
    const config = Config.googleSignIn;
    if (!config.iosClientId && !config.androidClientId) {
      console.warn('Google Sign-In client IDs not found. Please check your environment variables.');
    }
    return config;
  },
};

export default Config;
