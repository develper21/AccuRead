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

export interface MeterField {
  id: string;
  label: string;
  regex: string;
  required: boolean;
}

export interface MeterTemplate {
  id: string;
  name: string;
  provider: string; // e.g., 'TATA', 'ADANI', 'BSES'
  type: 'DIGITAL' | 'STATIC' | 'SMART';
  fields: MeterField[];
  guideBoxRatio: number; // For UI alignment
}

export interface MeterReading {
  [key: string]: string; // Dynamic mapping for template fields
}

export interface ConfidenceScores {
  serialNumber: number;
  kwh: number;
  kvah: number;
  maxDemandKw: number;
  demandKva: number;
}

export interface SecurityStatus {
  isTampered: boolean;
  tamperReason?: string;
  livenessConfidence: number; // 0 to 100
  isLive: boolean;
}

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'FIELD_WORKER';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  region?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  userName: string;
  metadata?: any;
  type?: 'info' | 'warning' | 'error';
  message?: string;
}

export interface TenantConfig {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  apiEndpoint: string;
  features: string[];
}

export interface MeterReadingResult {
  data: MeterReading;
  confidence: ConfidenceScores;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  processed?: boolean;
  isOffline?: boolean;
  securityStatus?: SecurityStatus;
  templateId?: string;
  analytics?: AnalyticsData;
  requiresReview?: boolean;
  capturedBy?: string;
  tenantId: string; // Multi-tenant support
  isSynced?: boolean; // Delta sync support
  lastModified: string;
}

export interface AnalyticsData {
  estimatedBill: number;
  consumptionDelta: number; // Consumption since last reading
  trend: 'UP' | 'DOWN' | 'STABLE';
  isAnomaly: boolean;
  alertMessage?: string;
}

export interface CameraQuality {
  isBlurred: boolean;
  hasGlare: boolean;
  isAligned: boolean;
  brightness: number;
  sharpness: number;
}

// Field Worklist Types
export interface MeterLocation {
  meterId: string;
  consumerName: string;
  address: string;
  latitude: number;
  longitude: number;
  meterNumber: string;
  consumerNumber: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedReading: string;
  lastReadingDate: string;
  assignedDate: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  notes?: string;
  routeOrder?: number;
}

export interface WorklistItem {
  id: string;
  meter: MeterLocation;
  distance: number; // Distance from current location in meters
  estimatedTime: number; // Estimated time to reach in minutes
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  assignedTo: string; // Field agent ID
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  notes?: string;
  photoEvidence?: string;
  readingData?: MeterReadingResult;
}

export interface RouteOptimization {
  totalDistance: number; // Total route distance in meters
  estimatedTime: number; // Total estimated time in minutes
  optimizedSequence: string[]; // Array of meter IDs in optimal order
  waypoints: Array<{
    meterId: string;
    coordinates: { latitude: number; longitude: number };
    order: number;
    distanceFromPrevious: number;
  }>;
}

export interface FieldAgentLocation {
  agentId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
}

export interface WorklistFilters {
  status?: WorklistItem['status'][];
  priority?: MeterLocation['priority'][];
  distanceRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
}
