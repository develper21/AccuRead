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
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Theme } from '../utils/theme';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallback?: React.ReactNode;
  showLoginButton?: boolean;
  customMessage?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole = [], 
  fallback,
  showLoginButton = true,
  customMessage
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.message}>
            {customMessage || 'Please sign in to access this feature.'}
          </Text>
          
          {showLoginButton && (
            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                // Navigate to login - this would typically use navigation
                console.log('Navigate to login');
              }}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole.length > 0 && user?.role) {
    const hasRequiredRole = requiredRole.includes(user.role);
    
    if (!hasRequiredRole) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Access Denied</Text>
            <Text style={styles.message}>
              You don't have permission to access this feature.
              Required roles: {requiredRole.join(', ')}
            </Text>
            <Text style={styles.currentRole}>
              Your current role: {user.role}
            </Text>
          </View>
        </View>
      );
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  currentRole: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Theme.spacing.sm,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthGuard;
