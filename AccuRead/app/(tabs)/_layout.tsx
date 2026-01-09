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
import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';
  const isFieldWorker = user?.role === 'FIELD_WORKER';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#050A18',
          borderTopColor: 'rgba(255,255,255,0.1)',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />
      {isFieldWorker && (
        <Tabs.Screen
          name="worklist"
          options={{
            title: 'Worklist',
            tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="list.bullet.clipboard" color={color} />,
          }}
        />
      )}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Manager',
            href: isAdmin ? '/dashboard' : null, // Hide if not admin/supervisor
            tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
