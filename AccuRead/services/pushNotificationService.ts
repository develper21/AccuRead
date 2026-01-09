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

import { useEffect, useState } from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { Config } from '../config/env';

// Conditional expo-notifications imports with fallbacks
let Notifications: any = null;
let getMessaging: any = null;
let getToken: any = null;

try {
  const expoNotifications = require('expo-notifications');
  Notifications = expoNotifications.Notifications;
  getMessaging = expoNotifications.getMessaging;
  getToken = expoNotifications.getToken;
} catch (error) {
  console.warn('expo-notifications not available, using fallback implementations');
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

export interface PushNotificationService {
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  getToken: () => Promise<string | null>;
  scheduleNotification: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => Promise<string>;
  sendPushNotification: (token: string, notification: PushNotification) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  getUnreadNotifications: () => PushNotification[];
  clearAllNotifications: () => Promise<void>;
}

class PushNotificationServiceImpl implements PushNotificationService {
  private static instance: PushNotificationServiceImpl;
  private notifications: PushNotification[] = [];
  private listeners: Array<(notifications: PushNotification[]) => void> = [];

  static getInstance(): PushNotificationServiceImpl {
    if (!PushNotificationServiceImpl.instance) {
      PushNotificationServiceImpl.instance = new PushNotificationServiceImpl();
    }
    return PushNotificationServiceImpl.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (!Notifications) {
        console.warn('expo-notifications not available, skipping initialization');
        return;
      }

      console.log(`Initializing push notifications on ${Platform.OS} with config:`, Config.app.name);

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Push notification permissions denied');
        return;
      }

      // Set notification handler with platform-specific behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true, // Default to true since Config.notifications is not available
          shouldPlaySound: false, // Default to false for better UX
          shouldSetBadge: false, // Default to false
        }),
      });

      // Set up message handler for push notifications
      if (Platform.OS === 'android' && getMessaging) {
        try {
          // Subscribe to app-specific topic
          const topicName = `${Config.app.name.toLowerCase().replace(/\s+/g, '-')}-users`;
          await getMessaging().subscribeToTopic(topicName);
          console.log(`Subscribed to topic: ${topicName}`);
        } catch (error) {
          console.warn('Failed to subscribe to topic:', error);
        }
      }

      console.log(`Push notifications initialized successfully for ${Config.app.name}`);
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Notifications) {
        console.warn('expo-notifications not available, returning false');
        return false;
      }

      console.log(`Requesting permissions on ${Platform.OS} for ${Config.app.name}`);

      if (Platform.OS === 'ios') {
        const authStatus = await Notifications.requestPermissionsAsync();
        const granted = authStatus.status === 'granted';
        console.log(`iOS permission status: ${authStatus.status} for ${Config.app.name}`);
        return granted;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log(`Android permission result: ${granted} for ${Config.app.name}`);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error(`Error requesting notification permissions for ${Config.app.name}:`, error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (!getToken) {
        console.warn('getToken not available, returning null');
        return null;
      }

      console.log(`Getting push token for ${Config.app.name} on ${Platform.OS}`);
      
      const token = await getToken();
      if (!token) {
        console.warn(`Failed to get push token for ${Config.app.name}`);
        return null;
      }
      
      console.log(`Push token retrieved for ${Config.app.name}:`, token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error(`Error getting push token for ${Config.app.name}:`, error);
      return null;
    }
  }

  async scheduleNotification(notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: PushNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(fullNotification);
    this.notifyListeners();
    
    // Schedule the notification if available
    if (Notifications) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data,
          },
          trigger: {
            seconds: 1, // Show immediately for now
          },
        });
      } catch (error) {
        console.warn('Failed to schedule notification:', error);
      }
    }

    return id;
  }

  async sendPushNotification(token: string, notification: PushNotification): Promise<void> {
    try {
      console.log(`Sending push notification for ${Config.app.name} to token:`, token.substring(0, 20) + '...');
      
      // In a real implementation, you would send this to your backend server
      // which would then use Firebase Cloud Messaging or another service
      const notificationPayload = {
        ...notification,
        appName: Config.app.name,
        appVersion: Config.app.version,
        platform: Platform.OS,
      };
      
      console.log('Notification payload:', notificationPayload);
      
      // For demo purposes, we'll just show a local notification if available
      if (Notifications) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.body,
              data: notificationPayload,
            },
            trigger: null, // Show immediately
          });
        } catch (error) {
          console.warn(`Failed to send local notification for ${Config.app.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error sending push notification for ${Config.app.name}:`, error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<void> {
    const notificationIndex = this.notifications.findIndex(n => n.id === id);
    if (notificationIndex !== -1) {
      this.notifications[notificationIndex].read = true;
      this.notifyListeners();
    }
  }

  getUnreadNotifications(): PushNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    this.notifyListeners();
    
    if (Notifications) {
      try {
        await Notifications.dismissAllNotificationsAsync();
      } catch (error) {
        console.warn('Failed to dismiss notifications:', error);
      }
    }
  }

  private handleNotification(notification: any): void {
    const pushNotification: PushNotification = {
      id: notification.requestIdentifier || `notification_${Date.now()}`,
      title: notification.content?.title || 'New Notification',
      body: notification.content?.body || '',
      data: notification.data,
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(pushNotification);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: PushNotification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Field agent specific notifications
export const FieldAgentNotifications = {
  // Worklist notifications
  newWorklistItem: (meterId: string, address: string) => ({
    title: 'New Worklist Item',
    body: `New meter reading assigned: ${meterId} at ${address}`,
    data: { type: 'worklist', meterId, address },
  }),

  // Route optimization notifications
  routeOptimized: (totalDistance: number, estimatedTime: number) => ({
    title: 'Route Optimized',
    body: `Route optimized: ${totalDistance}m, ${estimatedTime}min`,
    data: { type: 'route_optimization', totalDistance, estimatedTime },
  }),

  // Deadline reminders
  deadlineReminder: (meterId: string, dueDate: string) => ({
    title: 'Deadline Reminder',
    body: `Meter ${meterId} is due on ${dueDate}`,
    data: { type: 'deadline_reminder', meterId, dueDate },
  }),

  // Quality alerts
  qualityAlert: (type: 'blur' | 'glare' | 'alignment', message: string) => ({
    title: 'Quality Alert',
    body: message,
    data: { type: 'quality_alert', alertType: type },
  }),

  // Sync status
  syncStatus: (status: 'syncing' | 'synced' | 'failed', count: number) => ({
    title: 'Sync Status',
    body: `${status.charAt(0).toUpperCase() + status.slice(1)} ${count} items`,
    data: { type: 'sync_status', status, count },
  }),
};

// Manager notifications
export const ManagerNotifications = {
  // New field agent registration
  newAgentRegistered: (agentName: string, email: string) => ({
    title: 'New Agent Registered',
    body: `${agentName} (${email}) has joined the team`,
    data: { type: 'new_agent', agentName, email },
  }),

  // High confidence reading alerts
  highConfidenceReading: (meterId: string, confidence: number) => ({
    title: 'High Confidence Reading',
    body: `Meter ${meterId} captured with ${confidence}% confidence`,
    data: { type: 'high_confidence', meterId, confidence },
  }),

  // Low confidence alerts
  lowConfidenceReading: (meterId: string, confidence: number) => ({
    title: 'Review Required',
    body: `Meter ${meterId} needs review (${confidence}% confidence)`,
    data: { type: 'low_confidence', meterId, confidence },
  }),

  // System alerts
  systemAlert: (message: string, severity: 'info' | 'warning' | 'error') => ({
    title: 'System Alert',
    body: message,
    data: { type: 'system_alert', severity },
  }),
};

// Hook for using push notifications
export const usePushNotifications = () => {
  const service = PushNotificationServiceImpl.getInstance();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Initialize the service
    const initializeService = async () => {
      try {
        await service.initialize();
        setIsInitialized(true);
        
        // Check permissions
        const hasPermission = await service.requestPermissions();
        setPermissionGranted(hasPermission);
        
        // Load existing notifications
        setNotifications(service.getUnreadNotifications());
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializeService();
  }, [service]);

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = service.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, [service]);

  // Enhanced notification sender with platform-specific behavior
  const sendNotification = async (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    try {
      const id = await service.scheduleNotification(notification);
      
      // Show platform-specific alert for critical notifications
      if (notification.data?.priority === 'high') {
        Alert.alert(
          notification.title,
          notification.body,
          [
            { text: 'OK', onPress: () => console.log('Alert dismissed') },
            { text: 'View', onPress: () => console.log('View notification:', id) }
          ],
          { cancelable: false }
        );
      }
      
      return id;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  };

  // Get device token with platform-specific logging
  const getDeviceToken = async () => {
    try {
      const token = await service.getToken();
      console.log(`Device token retrieved on ${Platform.OS}:`, token?.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error(`Failed to get token on ${Platform.OS}:`, error);
      return null;
    }
  };

  // Clear all notifications with confirmation
  const clearAllNotifications = async () => {
    if (notifications.length === 0) {
      Alert.alert('No Notifications', 'You have no notifications to clear.');
      return;
    }

    Alert.alert(
      'Clear All Notifications',
      `Are you sure you want to clear ${notifications.length} notifications?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await service.clearAllNotifications();
            setNotifications([]);
            console.log(`Cleared ${notifications.length} notifications on ${Platform.OS}`);
          }
        }
      ]
    );
  };

  return {
    // Service methods
    scheduleNotification: service.scheduleNotification,
    sendPushNotification: service.sendPushNotification,
    markAsRead: service.markAsRead,
    getUnreadNotifications: service.getUnreadNotifications,
    
    // Enhanced methods
    sendNotification,
    getDeviceToken,
    clearAllNotifications,
    
    // State
    notifications,
    isInitialized,
    permissionGranted,
    unreadCount: notifications.filter(n => !n.read).length,
  };
};

export const pushNotificationService = PushNotificationServiceImpl.getInstance();
