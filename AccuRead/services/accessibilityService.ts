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
 * Accessibility Service
 * Provides Voice Guidance for users with limited literacy or vision.
 * Uses Text-to-Speech to guide the user during the capture process.
 */

// If using expo-speech: import * as Speech from 'expo-speech';
// For now, we simulate the speech logic

let lastSpokenTime = 0;
const VOICE_DEBOUNCE_MS = 3000; // Speak at most once every 3 seconds

export const AccessibilityService = {
    /**
     * Speaks the provided message to guide the user.
     * Includes a debounce mechanism to avoid rapid-fire talking.
     */
    announceGuidance: (message: string, force: boolean = false) => {
        const now = Date.now();
        if (force || (now - lastSpokenTime > VOICE_DEBOUNCE_MS)) {
            console.log(`[VoiceGuidance] Speaking: "${message}"`);

            // In production (with expo-speech):
            // Speech.speak(message, { language: 'en', pitch: 1.0, rate: 1.0 });

            lastSpokenTime = now;
        }
    },

    /**
     * Generates a voice command based on current camera quality issues.
     */
    getGuidanceFromWarning: (warning: string): string => {
        if (warning.includes('blurry')) return "Please hold the camera steady.";
        if (warning.includes('aligned')) return "Move the camera to align with the box.";
        if (warning.includes('dark')) return "The area is too dark. Moving to a brighter spot or using flash.";
        if (warning.includes('bright')) return "Too much glare. Please change your position.";
        if (warning.includes('focus')) return "Bring the camera a bit closer.";
        return warning;
    }
};
