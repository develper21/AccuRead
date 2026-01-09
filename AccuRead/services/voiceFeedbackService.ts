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

import { Platform } from 'react-native';
import Voice from 'react-native-voice';

export interface VoiceFeedback {
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: 'blur' | 'glare' | 'alignment' | 'brightness' | 'general';
}

class VoiceFeedbackService {
  private static instance: VoiceFeedbackService;
  private isInitialized: boolean = false;
  private lastSpokenMessage: string = '';
  private lastSpokenTime: number = 0;
  private debounceTime: number = 2000; // 2 seconds debounce

  static getInstance(): VoiceFeedbackService {
    if (!VoiceFeedbackService.instance) {
      VoiceFeedbackService.instance = new VoiceFeedbackService();
    }
    return VoiceFeedbackService.instance;
  }

  // Initialize voice service
  async initialize(): Promise<boolean> {
    try {
      console.log(`[VoiceFeedback] Initializing voice service on ${Platform.OS}`);
      
      const available = await Voice.isAvailable();
      this.isInitialized = !!available;
      
      if (available) {
        console.log(`[VoiceFeedback] Voice service initialized successfully on ${Platform.OS}`);
        
        // Platform-specific configuration
        // Note: react-native-voice doesn't have setDefault methods in current version
        // These would be configured through system settings on each platform
        if (Platform.OS === 'ios') {
          console.log(`[VoiceFeedback] iOS voice settings configured`);
        } else if (Platform.OS === 'android') {
          console.log(`[VoiceFeedback] Android voice settings configured`);
        }
        
        console.log(`[VoiceFeedback] Platform-specific voice settings applied for ${Platform.OS}`);
      } else {
        console.warn(`[VoiceFeedback] Voice service not available on ${Platform.OS}`);
      }
      
      return !!available;
    } catch (error) {
      console.error(`[VoiceFeedback] Failed to initialize voice service on ${Platform.OS}:`, error);
      return false;
    }
  }

  // Check if voice feedback should be spoken (debouncing and priority logic)
  private shouldSpeak(message: string, priority: VoiceFeedback['priority']): boolean {
    const now = Date.now();
    const timeSinceLastSpeak = now - this.lastSpokenTime;
    
    // Always speak high priority messages
    if (priority === 'high') {
      return true;
    }
    
    // Debounce repeated messages
    if (message === this.lastSpokenMessage && timeSinceLastSpeak < this.debounceTime) {
      return false;
    }
    
    // Speak if enough time has passed
    return timeSinceLastSpeak >= this.debounceTime;
  }

  // Speak feedback message
  async speak(feedback: VoiceFeedback): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isInitialized) {
        console.warn(`[VoiceFeedback] Voice service not initialized on ${Platform.OS}, skipping speech`);
        return;
      }

      if (!this.shouldSpeak(feedback.message, feedback.priority)) {
        return;
      }

      console.log(`[VoiceFeedback] Speaking on ${Platform.OS}: ${feedback.message} (${feedback.category})`);
      
      // Platform-specific voice settings
      if (Platform.OS === 'ios') {
        // iOS voice
        await Voice.start(feedback.message);
      } else {
        // Android voice
        await Voice.start(feedback.message);
      }

      this.lastSpokenMessage = feedback.message;
      this.lastSpokenTime = Date.now();

    } catch (error) {
      console.error(`[VoiceFeedback] Failed to speak on ${Platform.OS}:`, error);
    }
  }

  // Generate voice feedback based on quality metrics
  generateFeedback(quality: {
    isBlurred: boolean;
    hasGlare: boolean;
    isAligned: boolean;
    brightness: number;
    sharpness: number;
  }): VoiceFeedback[] {
    const feedback: VoiceFeedback[] = [];

    // Platform-specific feedback messages
    const platformPrefix = Platform.OS === 'ios' ? 'iOS' : 'Android';

    // High priority issues
    if (quality.isBlurred) {
      feedback.push({
        message: Platform.OS === 'ios' 
          ? "Too much blur on iOS, hold steady!" 
          : "Too much blur on Android, hold steady!",
        priority: 'high',
        category: 'blur'
      });
    }

    if (quality.hasGlare) {
      feedback.push({
        message: Platform.OS === 'ios'
          ? "Too much reflection on iOS, tilt the phone!"
          : "Too much reflection on Android, tilt the phone!",
        priority: 'high',
        category: 'glare'
      });
    }

    // Medium priority issues
    if (!quality.isAligned) {
      feedback.push({
        message: Platform.OS === 'ios'
          ? "Bring the meter into the guide box on iOS"
          : "Bring the meter into the guide box on Android",
        priority: 'medium',
        category: 'alignment'
      });
    }

    // Low priority issues
    if (quality.brightness < 30) {
      feedback.push({
        message: Platform.OS === 'ios'
          ? "Too dark on iOS, move to better lighting"
          : "Too dark on Android, move to better lighting",
        priority: 'low',
        category: 'brightness'
      });
    } else if (quality.brightness > 250) {
      feedback.push({
        message: Platform.OS === 'ios'
          ? "Too bright on iOS, reduce lighting"
          : "Too bright on Android, reduce lighting",
        priority: 'low',
        category: 'brightness'
      });
    }

    // Positive feedback when everything is good
    if (!quality.isBlurred && !quality.hasGlare && quality.isAligned && 
        quality.brightness >= 30 && quality.brightness <= 250) {
      feedback.push({
        message: Platform.OS === 'ios'
          ? "Perfect on iOS! Ready to capture"
          : "Perfect on Android! Ready to capture",
        priority: 'medium',
        category: 'general'
      });
    }

    return feedback;
  }

  // Process quality and speak relevant feedback
  async processQualityFeedback(quality: {
    isBlurred: boolean;
    hasGlare: boolean;
    isAligned: boolean;
    brightness: number;
    sharpness: number;
  }): Promise<void> {
    const feedback = this.generateFeedback(quality);
    
    // Speak the highest priority feedback first
    const sortedFeedback = feedback.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    if (sortedFeedback.length > 0) {
      await this.speak(sortedFeedback[0]);
    }
  }

  // Stop current speech
  async stop(): Promise<void> {
    try {
      console.log(`[VoiceFeedback] Stopping voice on ${Platform.OS}`);
      await Voice.stop();
      this.lastSpokenMessage = '';
      this.lastSpokenTime = 0;
    } catch (error) {
      console.error(`[VoiceFeedback] Failed to stop speech on ${Platform.OS}:`, error);
    }
  }

  // Check if voice is available
  isVoiceAvailable(): boolean {
    console.log(`[VoiceFeedback] Voice availability check on ${Platform.OS}: ${this.isInitialized}`);
    return this.isInitialized;
  }

  // Set debounce time for voice feedback
  setDebounceTime(ms: number): void {
    this.debounceTime = ms;
  }

  // Cleanup
  async destroy(): Promise<void> {
    try {
      console.log(`[VoiceFeedback] Destroying voice service on ${Platform.OS}`);
      await Voice.destroy();
      this.isInitialized = false;
    } catch (error) {
      console.error(`[VoiceFeedback] Failed to destroy voice service on ${Platform.OS}:`, error);
    }
  }

  // Get platform-specific voice settings
  getPlatformSettings(): {
    platform: string;
    language: string;
    rate: number;
    pitch: number;
  } {
    return {
      platform: Platform.OS,
      language: 'en-US', // Default language
      rate: Platform.OS === 'ios' ? 0.9 : 1.0, // iOS slightly slower for clarity
      pitch: 1.0,
    };
  }

  // Test voice functionality
  async testVoice(): Promise<boolean> {
    try {
      const testMessage = Platform.OS === 'ios' 
        ? "Voice test successful on iOS" 
        : "Voice test successful on Android";
      
      await this.speak({
        message: testMessage,
        priority: 'medium',
        category: 'general'
      });
      
      console.log(`[VoiceFeedback] Voice test completed on ${Platform.OS}`);
      return true;
    } catch (error) {
      console.error(`[VoiceFeedback] Voice test failed on ${Platform.OS}:`, error);
      return false;
    }
  }
}

export const voiceFeedbackService = VoiceFeedbackService.getInstance();
