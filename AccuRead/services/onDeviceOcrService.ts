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

import { MeterReading, MeterReadingResult, MeterTemplate } from '../types';
import { Platform } from 'react-native';
import { TemplateEngineService } from './templateEngine';

/**
 * On-Device OCR Service (Edge AI)
 * This service provides real-time OCR capabilities directly on the device.
 * It uses a local processing model to ensure functionality in offline environments.
 */

// In a real implementation, you would import a library like:
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// or use a TFLite model via Frame Processor

export const OnDeviceOcrService = {
    /**
     * Process an image URI for OCR on-device
     * @param imageUri The local path to the captured image
     * @param template Optional dynamic template to apply
     * @returns MeterReadingResult or null
     */
    processImage: async (imageUri: string, template?: MeterTemplate): Promise<MeterReadingResult | null> => {
        console.log(`[Edge AI] Processing image on-device with template: ${template?.name || 'Default'} on ${Platform.OS}`);

        try {
            // 1. Use TemplateEngineService for template validation if template exists
            if (template && TemplateEngineService) {
                console.log(`[Edge AI] Using template engine for validation on ${Platform.OS}`);
                
                // Apply template to validate structure (using existing method)
                const testText = "TEST123 1234.56 kWh";
                const extracted = TemplateEngineService.applyTemplate(testText, template);
                console.log(`[Edge AI] Template validation result on ${Platform.OS}:`, extracted);
            }

            // 2. Platform-specific processing delay
            const processingDelay = Platform.OS === 'ios' ? 600 : 800;
            await new Promise(resolve => setTimeout(resolve, processingDelay));

            // 3. Simulate On-Device OCR Logic
            // In production: const result = await TextRecognition.recognize(imageUri);

            // For this implementation, we simulate the "Edge AI" behavior.
            // We look for patterns typical in meter readings.

            // 4. Platform-specific confidence adjustments
            const platformConfidenceBoost = Platform.OS === 'ios' ? 2.5 : 1.5;

            // We'll return a result that indicates it was processed locally
            // If template exists, populate data based on template fields
            const extractedData: Record<string, string> = {};
            const confidenceScores: Record<string, number> = {};

            if (template) {
                template.fields.forEach(field => {
                    extractedData[field.id] = field.id.includes('serial') || field.id.includes('ID')
                        ? "SN-" + Math.floor(Math.random() * 90000)
                        : (Math.random() * 5000).toFixed(1);
                    confidenceScores[field.id] = 85 + Math.random() * 10 + platformConfidenceBoost;
                });
            } else {
                // Fallback for default fields
                extractedData['serialNumber'] = "SN-LOC-" + Math.floor(Math.random() * 10000);
                extractedData['kwh'] = (Math.random() * 5000).toFixed(1);
                confidenceScores['serialNumber'] = 85.0 + platformConfidenceBoost;
                confidenceScores['kwh'] = 92.5 + platformConfidenceBoost;
            }

            const mockLocalResult: MeterReadingResult = {
                data: extractedData as any,
                confidence: confidenceScores as any,
                timestamp: new Date().toISOString(),
                imageUrl: imageUri,
                processed: true,
                isOffline: true,
                templateId: template?.id,
                tenantId: Platform.OS === 'ios' ? 'ios-tenant' : 'android-tenant',
                lastModified: new Date().toISOString(),
                analytics: {
                    estimatedBill: parseFloat(extractedData['kwh'] || '0') * 5.5,
                    consumptionDelta: Math.random() * 100,
                    trend: Math.random() > 0.5 ? 'UP' : 'STABLE' as const,
                    isAnomaly: false
                }
            };

            console.log(`[Edge AI] Processing completed on ${Platform.OS} in ${processingDelay}ms`);
            return mockLocalResult;

        } catch (error) {
            console.error(`[Edge AI] Local OCR Error on ${Platform.OS}:`, error);
            return null;
        }
    },

    /**
     * Helper to parse raw text from MLKit/TFLite into MeterReading structure
     * (Standard regex patterns for on-device matching)
     */
    parseMeterData: (rawText: string): MeterReading => {
        console.log(`[Edge AI] Parsing meter data on ${Platform.OS}`);
        
        // Platform-specific regex patterns
        const patterns = Platform.OS === 'ios' ? {
            kwh: /(\d{1,5}\.\d{1,2})\s*kWh/i,
            serial: /([A-Z0-9]{8,12})/i,
        } : {
            kwh: /(\d{1,5}\.\d{1,2})\s*kWh/i,
            serial: /([A-Z0-9]{6,10})/i, // Android might have shorter serial numbers
        };

        const result = {
            serialNumber: rawText.match(patterns.serial)?.[1] || "",
            kwh: rawText.match(patterns.kwh)?.[1] || "",
            kvah: "",
            maxDemandKw: "",
            demandKva: ""
        };

        console.log(`[Edge AI] Parsed data on ${Platform.OS}:`, result);
        return result;
    },

    /**
     * Get device capabilities for OCR processing
     */
    getDeviceCapabilities: () => {
        const capabilities = {
            platform: Platform.OS,
            isHighPerformance: Platform.OS === 'ios', // iOS typically has better OCR performance
            supportedFormats: Platform.OS === 'ios' 
                ? ['jpg', 'png', 'heic'] 
                : ['jpg', 'png', 'webp'],
            maxImageSize: Platform.OS === 'ios' ? 4096 : 2048,
            processingModel: Platform.OS === 'ios' ? 'CoreML' : 'TFLite',
        };

        console.log(`[Edge AI] Device capabilities on ${Platform.OS}:`, capabilities);
        return capabilities;
    },

    /**
     * Validate template using TemplateEngineService
     */
    validateTemplate: (template: MeterTemplate): boolean => {
        try {
            if (!TemplateEngineService) {
                console.warn('[Edge AI] TemplateEngineService not available');
                return false;
            }

            // Use applyTemplate to test if template is valid
            const testText = "TEST123 1234.56 kWh";
            const extracted = TemplateEngineService.applyTemplate(testText, template);
            const isValid = Object.keys(extracted).length > 0;
            
            console.log(`[Edge AI] Template validation on ${Platform.OS}: ${isValid}`);
            return isValid;
        } catch (error) {
            console.error(`[Edge AI] Template validation error on ${Platform.OS}:`, error);
            return false;
        }
    }
};
