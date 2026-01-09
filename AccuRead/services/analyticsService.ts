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

import { MeterReadingResult, AnalyticsData } from '../types';
import { storageService } from './storage';

/**
 * Predictive Analytics Service
 * Calculates consumption trends, estimated bills, and detects anomalies.
 */

const COST_PER_UNIT = 8.50; // Dynamic rate per kWh (Simulation)
const TYPICAL_MONTHLY_AVG = 250; // Average units (Simulation)

export const AnalyticsService = {
    /**
     * Generates consumer insights based on current reading and history.
     */
    getConsumerInsights: async (currentResult: MeterReadingResult): Promise<AnalyticsData> => {
        console.log('[Analytics] Generating predictive insights...');

        // 1. Fetch historical readings
        const history = await storageService.getReadings();

        // Default values if no history exists
        let previousKwh = 0;
        if (history.length > 0) {
            // Sort by date and get latest
            const lastReading = history.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0];
            previousKwh = parseFloat(lastReading.data.kwh) || 0;
        }

        const currentKwh = parseFloat(currentResult.data.kwh) || 0;
        const delta = previousKwh > 0 ? Math.max(0, currentKwh - previousKwh) : 0;

        // 2. Bill Estimation
        const estimatedBill = delta * COST_PER_UNIT;

        // 3. Trend Analysis
        let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (delta > 0) trend = 'UP';

        // 4. Anomaly Detection (Spike/Leakage)
        // If usage is 50% higher than typical average, flag it
        const isAnomaly = delta > (TYPICAL_MONTHLY_AVG / 30 * 1.5); // Very simple daily threshold logic
        let alertMessage = undefined;

        if (isAnomaly) {
            alertMessage = "UNUSUAL CONSUMPTION: We detected a sharp spike. Possible leakage or unauthorized load.";
        } else if (delta === 0 && previousKwh > 0) {
            alertMessage = "No change in reading. Verify if meter is active.";
        }

        return {
            estimatedBill,
            consumptionDelta: delta,
            trend,
            isAnomaly,
            alertMessage
        };
    }
};
