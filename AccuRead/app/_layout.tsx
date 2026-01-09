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

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// @ts-ignore
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { I18nProvider } from '../contexts/I18nContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, loading, isAuthenticated } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentSegment = segments[segments.length - 1];

    // 1. Redirect unauthenticated users to login
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    // 2. Redirect authenticated users from auth pages to home
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    // 3. Role-based access control for protected routes
    if (isAuthenticated && !inAuthGroup) {
      // Dashboard access - only ADMIN and SUPERVISOR roles
      if (currentSegment === 'dashboard') {
        const allowedRoles = ['ADMIN', 'SUPERVISOR'];
        if (!user?.role || !allowedRoles.includes(user.role)) {
          console.warn(`Access denied: User role ${user?.role} not authorized for dashboard`);
          router.replace('/(tabs)'); // Redirect to home
          return;
        }
      }

      // Camera/Home access - all authenticated users allowed
      // Additional checks can be added here if needed
    }
  }, [isAuthenticated, segments, loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050A18' }}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
