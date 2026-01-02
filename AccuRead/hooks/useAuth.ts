import { useState, useEffect, useCallback } from 'react';
import { authService, User, AuthState } from '../services/auth';

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
    const unsubscribe = authService.onAuthStateChanged((user) => {
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
  const signUp = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signUp(email, password);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signIn(email, password);
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  // Sign In with Google
  const signInWithGoogle = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signInWithGoogle();
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      return user;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
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
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.resetPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  // Clear Error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    clearError,
    isAuthenticated: !!authState.user,
  };
};
