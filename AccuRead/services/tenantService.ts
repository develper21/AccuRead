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

import { TenantConfig } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tenant Service
 * Manages Multi-Tenant branding and configuration.
 * Allows the app to adapt to different utility companies (BSES, Torrent Power, etc.)
 */

const TENANTS: Record<string, TenantConfig> = {
    'bses': {
        id: 'bses',
        name: 'BSES Rajdhani',
        logo: 'https://example.com/bses-logo.png',
        primaryColor: '#ED1C24',
        apiEndpoint: 'https://api.bses.in/v1',
        features: ['ocr', 'fraud_detection', 'geofencing']
    },
    'torrent': {
        id: 'torrent',
        name: 'Torrent Power',
        logo: 'https://example.com/torrent-logo.png',
        primaryColor: '#0055A5',
        apiEndpoint: 'https://api.torrentpower.com/v1',
        features: ['ocr', 'analytics', 'offline_mode']
    },
    'tata': {
        id: 'tata',
        name: 'Tata Power',
        logo: 'https://example.com/tata-logo.png',
        primaryColor: '#00B5E2',
        apiEndpoint: 'https://api.tatapower.com/v1',
        features: ['ocr', 'fraud_detection', 'analytics', 'geofencing']
    }
};

const STORAGE_KEY = '@accuread_current_tenant';

export const TenantService = {
    /**
     * Gets the currently active tenant configuration.
     */
    getCurrentTenant: async (): Promise<TenantConfig> => {
        const tenantId = await AsyncStorage.getItem(STORAGE_KEY);
        return TENANTS[tenantId || 'bses'] || TENANTS['bses'];
    },

    /**
     * Sets the current tenant (e.g., during login or initial setup).
     */
    setTenant: async (tenantId: string): Promise<void> => {
        if (TENANTS[tenantId]) {
            await AsyncStorage.setItem(STORAGE_KEY, tenantId);
        }
    },

    /**
     * Returns all available tenants (for selection or admin).
     */
    getAllTenants: (): TenantConfig[] => {
        return Object.values(TENANTS);
    }
};
