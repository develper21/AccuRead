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

import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import { Config } from '../config/env';

export interface SyncEvent {
  id: string;
  type: 'reading' | 'worklist' | 'user' | 'system';
  action: 'create' | 'update' | 'delete' | 'sync';
  data: any;
  timestamp: number;
  userId: string;
  deviceId: string;
}

export interface WebSocketMessage {
  type: 'sync' | 'notification' | 'heartbeat' | 'error';
  payload: any;
  timestamp: number;
}

export interface RealtimeSyncService {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: () => boolean;
  sendEvent: (event: SyncEvent) => Promise<void>;
  subscribe: (callback: (event: SyncEvent) => void) => () => void;
  subscribeToNotifications: (callback: (notification: any) => void) => () => void;
  getPendingEvents: () => SyncEvent[];
  retrySync: () => Promise<void>;
}

class RealtimeSyncServiceImpl implements RealtimeSyncService {
  private static instance: RealtimeSyncServiceImpl;
  private ws: any | null = null; // Use any for React Native WebSocket compatibility
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners: Array<(event: SyncEvent) => void> = [];
  private notificationListeners: Array<(notification: any) => void> = [];
  private pendingEvents: SyncEvent[] = [];
  private heartbeatInterval: any | null = null; // Use any for React Native compatibility
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private connectionCheckInterval: any | null = null;

  static getInstance(): RealtimeSyncServiceImpl {
    if (!RealtimeSyncServiceImpl.instance) {
      RealtimeSyncServiceImpl.instance = new RealtimeSyncServiceImpl();
    }
    return RealtimeSyncServiceImpl.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.connectionStatus === 'connected') {
      return;
    }

    this.isConnecting = true;
    this.connectionStatus = 'connecting';

    try {
      // Check network connectivity and platform
      console.log(`[${Platform.OS}] Attempting to connect to ${Config.app.name} sync service...`);
      
      // Build WebSocket URL with Config
      const wsUrl = Config.api.baseUrl.replace('http', 'ws') + '/ws';
      console.log(`[${Platform.OS}] Connecting to WebSocket:`, wsUrl);

      // Create WebSocket with React Native compatibility
      this.ws = new (global as any).WebSocket || new WebSocket(wsUrl);

      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error(`[${Platform.OS}] WebSocket connection error:`, error);
      this.isConnecting = false;
      this.connectionStatus = 'disconnected';
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    console.log(`[${Platform.OS}] Disconnecting from ${Config.app.name} sync service`);
    
    this.isConnecting = false;
    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.connectionStatus === 'connected' && 
           this.ws && 
           this.ws.readyState === 1; // WebSocket.OPEN = 1
  }

  async sendEvent(event: SyncEvent): Promise<void> {
    // Add platform and app info to event
    const enhancedEvent = {
      ...event,
      platform: Platform.OS,
      appName: Config.app.name,
      appVersion: Config.app.version,
    };

    if (!this.isConnected()) {
      // Add to pending events for retry
      this.pendingEvents.push(enhancedEvent);
      console.log(`[${Platform.OS}] Event added to pending queue:`, enhancedEvent.id);
      return;
    }

    try {
      const message: WebSocketMessage = {
        type: 'sync',
        payload: enhancedEvent,
        timestamp: Date.now(),
      };

      this.ws?.send(JSON.stringify(message));
      console.log(`[${Platform.OS}] Event sent:`, enhancedEvent.id);
    } catch (error) {
      console.error(`[${Platform.OS}] Error sending event:`, error);
      this.pendingEvents.push(enhancedEvent);
    }
  }

  subscribe(callback: (event: SyncEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== callback);
    };
  }

  subscribeToNotifications(callback: (notification: any) => void): () => void {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== callback);
    };
  }

  getPendingEvents(): SyncEvent[] {
    return [...this.pendingEvents];
  }

  async retrySync(): Promise<void> {
    console.log('Retrying sync for pending events...');
    
    for (const event of this.pendingEvents) {
      try {
        await this.sendEvent(event);
        // Remove from pending after successful send
        this.pendingEvents = this.pendingEvents.filter(e => e.id !== event.id);
      } catch (error) {
        console.error('Failed to retry event:', event.id, error);
      }
    }
  }

  private handleOpen(): void {
    console.log(`[${Platform.OS}] WebSocket connected to ${Config.app.name} sync service`);
    this.isConnecting = false;
    this.connectionStatus = 'connected';
    this.reconnectAttempts = 0;

    // Start heartbeat
    this.startHeartbeat();

    // Start connection monitoring
    this.startConnectionMonitoring();

    // Send pending events
    if (this.pendingEvents.length > 0) {
      console.log(`[${Platform.OS}] Sending ${this.pendingEvents.length} pending events`);
      this.retrySync();
    }

    // Send initial sync request
    this.sendInitialSync();
  }

  private handleMessage(event: any): void { // Use any for React Native compatibility
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log(`[${Platform.OS}] Received message type:`, message.type);
      
      switch (message.type) {
        case 'sync':
          this.handleSyncEvent(message.payload);
          break;
        case 'notification':
          this.handleNotification(message.payload);
          break;
        case 'heartbeat':
          this.handleHeartbeat();
          break;
        case 'error':
          this.handleError(message.payload);
          break;
        default:
          console.warn(`[${Platform.OS}] Unknown message type:`, message.type);
      }
    } catch (error) {
      console.error(`[${Platform.OS}] Error parsing WebSocket message:`, error);
    }
  }

  private handleClose(event: any): void { // Use any for React Native compatibility
    console.log(`[${Platform.OS}] WebSocket closed:`, event?.code, event?.reason);
    this.connectionStatus = 'disconnected';
    this.isConnecting = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    if (event?.code !== 1000) { // Not a normal closure
      this.scheduleReconnect();
    }
  }

  private handleError(error: any): void {
    console.error('WebSocket error:', error);
    this.connectionStatus = 'disconnected';
    this.isConnecting = false;
    this.scheduleReconnect();
  }

  private handleSyncEvent(event: SyncEvent): void {
    console.log('Received sync event:', event.id);
    this.eventListeners.forEach(listener => listener(event));
  }

  private handleNotification(notification: any): void {
    console.log('Received notification:', notification);
    this.notificationListeners.forEach(listener => listener(notification));
  }

  private handleHeartbeat(): void {
    console.log('Heartbeat received');
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        const heartbeat: WebSocketMessage = {
          type: 'heartbeat',
          payload: { 
            timestamp: Date.now(),
            platform: Platform.OS,
            appName: Config.app.name,
          },
          timestamp: Date.now(),
        };
        this.ws?.send(JSON.stringify(heartbeat));
        console.log(`[${Platform.OS}] Heartbeat sent`);
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private startConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    this.connectionCheckInterval = setInterval(() => {
      if (!this.isConnected() && this.connectionStatus === 'connected') {
        console.log(`[${Platform.OS}] Connection lost, attempting reconnect`);
        this.connectionStatus = 'disconnected';
        this.scheduleReconnect();
      }
    }, 5000); // Check every 5 seconds
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.connectionStatus = 'reconnecting';
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private sendInitialSync(): void {
    const syncEvent: SyncEvent = {
      id: `initial_sync_${Date.now()}`,
      type: 'system',
      action: 'sync',
      data: { 
        request: 'initial_sync',
        platform: Platform.OS,
        appName: Config.app.name,
        appVersion: Config.app.version,
      },
      timestamp: Date.now(),
      userId: 'current_user', // This should come from auth context
      deviceId: Platform.OS,
    };

    this.sendEvent(syncEvent);
  }
}

// Hook for using real-time sync
export const useRealtimeSync = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pendingEvents, setPendingEvents] = useState<SyncEvent[]>([]);
  const service = RealtimeSyncServiceImpl.getInstance();
  const serviceRef = useRef(service);
  const connectionAttemptsRef = useRef(0);
  const lastConnectionTimeRef = useRef<number>(0);

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribe = service.subscribe((event) => {
      if (event.type === 'system' && event.action === 'sync') {
        // Handle system events
        console.log('System sync event received:', event.id);
      }
    });

    // Update connection status
    const checkConnection = () => {
      const currentlyConnected = serviceRef.current.isConnected();
      setIsConnected(currentlyConnected);
      setPendingEvents(serviceRef.current.getPendingEvents());
      
      // Track connection attempts
      if (currentlyConnected && !isConnected) {
        connectionAttemptsRef.current = 0;
        lastConnectionTimeRef.current = Date.now();
      } else if (!currentlyConnected && isConnected) {
        connectionAttemptsRef.current++;
      }
    };

    const interval = setInterval(checkConnection, 1000);

    // Initialize connection on mount
    if (!serviceRef.current.isConnected()) {
      serviceRef.current.connect();
    }

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [service, isConnected]);

  // Enhanced send event with retry logic
  const sendEventWithRetry = async (event: SyncEvent, maxRetries: number = 3): Promise<boolean> => {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        await serviceRef.current.sendEvent(event);
        return true;
      } catch (error) {
        attempts++;
        console.log(`Event send attempt ${attempts} failed:`, error);
        
        if (attempts < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }
    
    console.error(`Failed to send event after ${maxRetries} attempts:`, event.id);
    return false;
  };

  // Get connection statistics
  const getConnectionStats = () => {
    return {
      isConnected,
      pendingCount: pendingEvents.length,
      connectionAttempts: connectionAttemptsRef.current,
      lastConnectionTime: lastConnectionTimeRef.current,
      uptime: lastConnectionTimeRef.current > 0 ? Date.now() - lastConnectionTimeRef.current : 0,
    };
  };

  // Manual reconnect with attempt tracking
  const reconnect = async () => {
    if (!isConnected) {
      connectionAttemptsRef.current++;
      console.log(`Manual reconnect attempt ${connectionAttemptsRef.current}`);
      await serviceRef.current.connect();
    }
  };

  return {
    isConnected,
    pendingEvents,
    connect: serviceRef.current.connect,
    disconnect: serviceRef.current.disconnect,
    sendEvent: sendEventWithRetry,
    subscribe: serviceRef.current.subscribe,
    retrySync: serviceRef.current.retrySync,
    getConnectionStats,
    reconnect,
  };
};

// Sync event creators
export const SyncEvents = {
  // Reading events
  readingCreated: (readingId: string, data: any) => ({
    id: `reading_created_${readingId}`,
    type: 'reading' as const,
    action: 'create' as const,
    data,
    timestamp: Date.now(),
    userId: 'current_user',
    deviceId: Platform.OS,
  }),

  readingUpdated: (readingId: string, data: any) => ({
    id: `reading_updated_${readingId}`,
    type: 'reading' as const,
    action: 'update' as const,
    data,
    timestamp: Date.now(),
    userId: 'current_user',
    deviceId: Platform.OS,
  }),

  // Worklist events
  worklistAssigned: (agentId: string, worklistId: string) => ({
    id: `worklist_assigned_${worklistId}`,
    type: 'worklist' as const,
    action: 'update' as const,
    data: { agentId, worklistId },
    timestamp: Date.now(),
    userId: 'current_user',
    deviceId: Platform.OS,
  }),

  worklistCompleted: (worklistId: string, data: any) => ({
    id: `worklist_completed_${worklistId}`,
    type: 'worklist' as const,
    action: 'update' as const,
    data,
    timestamp: Date.now(),
    userId: 'current_user',
    deviceId: Platform.OS,
  }),

  // User events
  userOnline: (userId: string) => ({
    id: `user_online_${userId}`,
    type: 'user' as const,
    action: 'update' as const,
    data: { status: 'online' },
    timestamp: Date.now(),
    userId,
    deviceId: Platform.OS,
  }),

  userOffline: (userId: string) => ({
    id: `user_offline_${userId}`,
    type: 'user' as const,
    action: 'update' as const,
    data: { status: 'offline' },
    timestamp: Date.now(),
    userId,
    deviceId: Platform.OS,
  }),
};

export const realtimeSyncService = RealtimeSyncServiceImpl.getInstance();
