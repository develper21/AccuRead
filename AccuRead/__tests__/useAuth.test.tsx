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

/// <reference types="jest" />
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../contexts/AuthContext';

// Declare Jest globals
declare global {
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void) => void;
  const expect: (actual: any) => {
    toBe: (value: any) => void;
    toBeNull: () => void;
    toBeDefined: () => void;
    toEqual: (value: any) => void;
  };
}

// Simple test for useAuth hook
describe('useAuth Hook', () => {
  it('should initialize correctly', () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthProvider, null, children)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle sign in with act', async () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthProvider, null, children)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    await act(async () => {
      try {
        await result.current.signIn('test@example.com', 'password');
      } catch (error) {
        // Expected in test environment
      }
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('should handle sign out with act', async () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthProvider, null, children)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should clear error with act', () => {
    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthProvider, null, children)
    );

    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });
});
