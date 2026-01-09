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

import { GeofencingService } from '../services/geofencingService';

describe('GeofencingService', () => {
    const targetLat = 28.6139; // Delhi center
    const targetLon = 77.2090;

    test('should detect location within 10 meters', () => {
        // A point very close (approx 2-3 meters away)
        const currentLat = 28.61391;
        const currentLon = 77.20901;

        const result = GeofencingService.checkProximity(currentLat, currentLon, targetLat, targetLon, 10);
        expect(result.isWithinRange).toBe(true);
        expect(result.distance).toBeLessThan(10);
    });

    test('should detect location outside 10 meters', () => {
        // A point further away
        const currentLat = 28.6150;
        const currentLon = 77.2100;

        const result = GeofencingService.checkProximity(currentLat, currentLon, targetLat, targetLon, 10);
        expect(result.isWithinRange).toBe(false);
        expect(result.distance).toBeGreaterThan(10);
    });

    test('should calculate distance using Haversine formula correctly', () => {
        // Delhi to Mumbai approx distance (approx 1100km)
        const mumbaiLat = 19.0760;
        const mumbaiLon = 72.8777;

        const distance = GeofencingService.calculateDistance(targetLat, targetLon, mumbaiLat, mumbaiLon);
        expect(distance).toBeGreaterThan(1100000); // Distance in meters
        expect(distance).toBeLessThan(1200000);
    });
});
