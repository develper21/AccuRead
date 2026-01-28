/**
 * Error handling utility for API calls
 */

import { AxiosError } from 'axios';

export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class APIErrorHandler {
  static handleError(error: any): APIError {
    if (error?.isAxiosError) {
      const axiosError = error as AxiosError;
      
      // Network errors
      if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED') {
          return {
            message: 'Request timeout. Please check your connection.',
            code: 'TIMEOUT',
            details: axiosError.message
          };
        }
        
        return {
          message: 'Network error. Unable to connect to backend.',
          code: 'NETWORK_ERROR',
          details: axiosError.message
        };
      }
      
      // Server responses
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      switch (status) {
        case 400:
          return {
            message: data?.detail || 'Bad request. Please check your input.',
            code: 'BAD_REQUEST',
            status,
            details: data
          };
          
        case 401:
          return {
            message: 'Unauthorized. Please login again.',
            code: 'UNAUTHORIZED',
            status,
            details: data
          };
          
        case 404:
          return {
            message: 'Endpoint not found.',
            code: 'NOT_FOUND',
            status,
            details: data
          };
          
        case 500:
          return {
            message: 'Server error. Please try again later.',
            code: 'SERVER_ERROR',
            status,
            details: data
          };
          
        default:
          return {
            message: data?.detail || `HTTP Error ${status}`,
            code: 'HTTP_ERROR',
            status,
            details: data
          };
      }
    }
    
    // Generic errors
    return {
      message: error?.message || 'An unknown error occurred.',
      code: 'UNKNOWN_ERROR',
      details: error
    };
  }
  
  static getErrorMessage(error: APIError): string {
    return error.message;
  }
  
  static isNetworkError(error: APIError): boolean {
    return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT';
  }
  
  static isServerError(error: APIError): boolean {
    return error.code === 'SERVER_ERROR' || !!(error.status && error.status >= 500);
  }
}
