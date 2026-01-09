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

/**
 * Geofencing Service
 * Calculates distance between two coordinates and validates against thresholds.
 */

export const GeofencingService = {
    /**
     * Calculates the distance between two points in meters using the Haversine formula.
     */
    calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in meters
        return distance;
    },

    /**
     * Validates if the capture location is within the allowed radius of the meter location.
     */
    checkProximity: (
        captureLat: number,
        captureLon: number,
        meterLat: number,
        meterLon: number,
        threshold: number = 10
    ): { isWithinRange: boolean; distance: number } => {
        const distance = GeofencingService.calculateDistance(captureLat, captureLon, meterLat, meterLon);
        return {
            isWithinRange: distance <= threshold,
            distance
        };
    }
};
