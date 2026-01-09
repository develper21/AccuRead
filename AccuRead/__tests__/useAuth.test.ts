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

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from '../contexts/AuthContext';

// Mock Firebase Auth
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(() => Promise.resolve()),
    sendPasswordResetEmail: jest.fn(),
    onAuthStateChanged: jest.fn(),
  })),
}));

// Mock Google Sign-In
jest.mock('@react-native-google-signin/google-signin', () => ({
  hasPlayServices: jest.fn(() => Promise.resolve(true)),
  signIn: jest.fn(() => Promise.resolve({
    user: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })),
  signOut: jest.fn(() => Promise.resolve()),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(AuthProvider, null, children)
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null user and loading false', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle sign in correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    // Mock successful sign in
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      role: 'FIELD_WORKER' as const,
    };

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle sign up correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      role: 'FIELD_WORKER' as const,
    };

    await act(async () => {
      await result.current.signUp('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle sign out correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    // First sign in
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then sign out
    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle Google sign in correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    const mockUser = {
      uid: 'google-uid',
      email: 'google@example.com',
      displayName: 'Google User',
      photoURL: 'https://example.com/photo.jpg',
      role: 'ADMIN' as const,
    };

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle password reset correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    // Password reset should not change auth state
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle errors correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    // Mock sign in error
    const mockSignIn = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    jest.requireMock('@react-native-firebase/auth').getAuth().signInWithEmailAndPassword = mockSignIn;

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong-password');
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should clear errors after successful operation', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });
    
    // First trigger an error
    const mockSignIn = jest.fn().mockRejectedValueOnce(new Error('Invalid credentials'));
    jest.requireMock('@react-native-firebase/auth').getAuth().signInWithEmailAndPassword = mockSignIn;

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrong-password');
    });

    expect(result.current.error).toBe('Invalid credentials');

    // Then successful sign in
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      role: 'FIELD_WORKER' as const,
    };

    mockSignIn.mockResolvedValueOnce({ user: mockUser });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.error).toBeNull();
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
