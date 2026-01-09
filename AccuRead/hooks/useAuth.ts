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

import { useState, useEffect, useCallback } from 'react';
import { authService, AuthUser, AuthState } from '../services/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth on mount
  useEffect(() => {
    // Initialize Google Sign-In
    authService.initializeGoogleSignIn();

    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChanged((user: AuthUser | null) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Sign Up
  const signUp = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signUp(email, password);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Sign In
  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signIn(email, password);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign in';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Sign In with Google
  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signInWithGoogle();
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during Google sign in';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      await authService.signOut();
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign out';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.resetPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during password reset';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  // Clear Error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError,
    isAuthenticated: !!authState.user,
  };
};
