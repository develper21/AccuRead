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

import { MeterTemplate } from '../types';

/**
 * Template Engine Service
 * Manages dynamic meter configurations for different regions/providers.
 * In a real-world scenario, these templates would be fetched from a CDN or API.
 */

const DEFAULT_TEMPLATES: MeterTemplate[] = [
    {
        id: 'generic-digital',
        name: 'Standard Digital Meter',
        provider: 'National Grid',
        type: 'DIGITAL',
        guideBoxRatio: 0.6,
        fields: [
            { id: 'serialNumber', label: 'Serial No.', regex: '^[A-Z0-9]{8,12}$', required: true },
            { id: 'kwh', label: 'kWh Reading', regex: '^\\d{1,6}\\.\\d{1}$', required: true },
            { id: 'maxDemandKw', label: 'Max Demand (kW)', regex: '^\\d{1,3}\\.\\d{2}$', required: false }
        ]
    },
    {
        id: 'smart-iot-v2',
        name: 'Smart IoT Meter v2',
        provider: 'Tata Power',
        type: 'SMART',
        guideBoxRatio: 0.8,
        fields: [
            { id: 'meterID', label: 'Meter ID', regex: '^TATA-\\d{6}$', required: true },
            { id: 'curReading', label: 'Current Reading', regex: '^\\d{7}$', required: true },
            { id: 'kvah', label: 'kVAh Reading', regex: '^\\d{1,6}\\.\\d{1}$', required: true }
        ]
    }
];

export const TemplateEngineService = {
    /**
     * Fetches active templates for the user's region.
     * Logic can be added here to prioritize templates based on GPS location.
     */
    getTemplates: async (): Promise<MeterTemplate[]> => {
        // In production: const response = await api.get('/templates');
        return DEFAULT_TEMPLATES;
    },

    /**
     * Matches raw text against a specific template's fields
     */
    applyTemplate: (rawText: string, template: MeterTemplate): Record<string, string> => {
        const extracted: Record<string, string> = {};

        template.fields.forEach(field => {
            const match = new RegExp(field.regex, 'm').exec(rawText);
            extracted[field.id] = match ? match[0] : '';
        });

        return extracted;
    }
};
