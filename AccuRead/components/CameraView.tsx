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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor, runAtTargetFps } from 'react-native-vision-camera';
import { CameraQuality } from '../types';
import { Theme } from '../utils/theme';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { StreamProcessorService } from '../services/streamProcessor';
import { voiceFeedbackService } from '../services/voiceFeedbackService';
import { qualityAnalysisWorklet } from '../worklets/qualityAnalysisWorklets';

const { width } = Dimensions.get('window');

interface CameraViewProps {
  onCapture: (imageUri: string) => void;
  onQualityChange: (quality: CameraQuality) => void;
  autoFlash?: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onQualityChange, autoFlash }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraQuality, setCameraQuality] = useState<CameraQuality>({
    isBlurred: false,
    hasGlare: false,
    isAligned: false,
    brightness: 100,
    sharpness: 100,
  });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const lastVoiceTime = useRef(0);

  // Initialize voice feedback
  useEffect(() => {
    voiceFeedbackService.initialize().then(available => {
      setVoiceEnabled(available);
    });
  }, []);

  // Check camera permission
  useEffect(() => {
    (async () => {
      const permission = await request(PERMISSIONS.ANDROID.CAMERA);
      setHasPermission(permission === RESULTS.GRANTED);
    })();
  }, []);

  // Pulse animation for guide box
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [pulseAnimation]);

  // Real-time frame processor with worklets
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    runAtTargetFps(5, () => {
      'worklet';
      
      try {
        // Run quality analysis worklets
        const qualityResult = qualityAnalysisWorklet(frame);
        
        // Send results back to UI thread
        if (qualityResult) {
          // Update camera quality state
          const updatedQuality: CameraQuality = {
            isBlurred: qualityResult.isBlurred,
            hasGlare: qualityResult.hasGlare,
            isAligned: qualityResult.isAligned,
            brightness: qualityResult.brightness,
            sharpness: qualityResult.sharpness,
          };
          
          // Call onQualityChange callback
          onQualityChange(updatedQuality);
        }
      } catch (error) {
        console.error('[FrameProcessor] Error processing frame:', error);
      }
    });
  }, [onQualityChange]);

  // Voice feedback handler
  const handleVoiceFeedback = useCallback(async (quality: CameraQuality) => {
    if (!voiceEnabled || isProcessing) return;
    
    const now = Date.now();
    // Debounce voice feedback to avoid spam
    if (now - lastVoiceTime.current < 2000) return;
    
    lastVoiceTime.current = now;
    
    try {
      await voiceFeedbackService.processQualityFeedback(quality);
    } catch (error) {
      console.error('[CameraView] Voice feedback error:', error);
    }
  }, [voiceEnabled, isProcessing]);

  // Handle quality changes with voice feedback
  useEffect(() => {
    onQualityChange(cameraQuality);
    handleVoiceFeedback(cameraQuality);
  }, [cameraQuality, onQualityChange, handleVoiceFeedback]);

  const handleCapture = async () => {
    if (camera.current) {
      try {
        setIsProcessing(true);
        console.log(`[StreamProcessor] Burst Capture Flash: ${autoFlash ? 'ON' : 'OFF'}`);
        const frames: { uri: string; score: number }[] = [];

        // Take 5 quick captures
        for (let i = 0; i < 5; i++) {
          const photo = await camera.current.takePhoto({
            //@ts-ignore
            qualityPrioritization: 'speed',
            flash: autoFlash ? 'on' : 'off',
          });

          const simulatedScore = 70 + Math.random() * 30;
          frames.push({ uri: `file://${photo.path}`, score: simulatedScore });
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        const bestFrame = StreamProcessorService.selectBestFrames(frames, 1)[0];
        onCapture(bestFrame.uri);
      } catch (error) {
        console.error('Error in smart capture burst:', error);
        Alert.alert('Capture Failed', 'Could not process stream frames.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Camera permission required</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No camera device available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
      />

      <View style={styles.overlayContainer}>
        {/* Quality Indicators */}
        <View style={styles.qualityIndicators}>
          <View style={[
            styles.qualityIndicator,
            cameraQuality.isBlurred && styles.qualityBad,
            !cameraQuality.isBlurred && styles.qualityGood
          ]}>
            <Text style={styles.qualityIndicatorText}>
              {cameraQuality.isBlurred ? 'Blurry' : 'Sharp'}
            </Text>
          </View>
          
          <View style={[
            styles.qualityIndicator,
            cameraQuality.hasGlare && styles.qualityBad,
            !cameraQuality.hasGlare && styles.qualityGood
          ]}>
            <Text style={styles.qualityIndicatorText}>
              {cameraQuality.hasGlare ? 'Glare' : 'Clear'}
            </Text>
          </View>
          
          <View style={[
            styles.qualityIndicator,
            cameraQuality.isAligned ? styles.qualityGood : styles.qualityBad
          ]}>
            <Text style={styles.qualityIndicatorText}>
              {cameraQuality.isAligned ? 'Aligned' : 'Adjust'}
            </Text>
          </View>
          
          <View style={[
            styles.qualityIndicator,
            (cameraQuality.brightness < 30 || cameraQuality.brightness > 250) && styles.qualityBad,
            cameraQuality.brightness >= 30 && cameraQuality.brightness <= 250 && styles.qualityGood
          ]}>
            <Text style={styles.qualityIndicatorText}>
              {cameraQuality.brightness < 30 ? 'Dark' : 
               cameraQuality.brightness > 250 ? 'Bright' : 'Good'}
            </Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.guideBox,
            {
              transform: [{ scale: pulseAnimation }],
              borderColor: cameraQuality.isAligned && !cameraQuality.isBlurred && !cameraQuality.hasGlare
                ? Theme.colors.success
                : cameraQuality.isBlurred || cameraQuality.hasGlare
                ? Theme.colors.error
                : '#3B82F6',
              backgroundColor: cameraQuality.isAligned && !cameraQuality.isBlurred && !cameraQuality.hasGlare
                ? 'rgba(34, 197, 94, 0.1)'
                : cameraQuality.isBlurred || cameraQuality.hasGlare
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(59, 130, 246, 0.05)',
            },
          ]}>
          <Text style={[
            styles.guideText,
            {
              color: cameraQuality.isAligned && !cameraQuality.isBlurred && !cameraQuality.hasGlare
                ? Theme.colors.success
                : '#FFF'
            }
          ]}>
            {cameraQuality.isAligned && !cameraQuality.isBlurred && !cameraQuality.hasGlare
              ? 'Perfect! Ready to capture'
              : cameraQuality.isBlurred
              ? 'Hold steady, too blurry'
              : cameraQuality.hasGlare
              ? 'Too much reflection'
              : 'Align meter within frame'}
          </Text>
        </Animated.View>

        {/* Voice Feedback Indicator */}
        {voiceEnabled && (
          <View style={styles.voiceIndicator}>
            <View style={[
              styles.voiceDot,
              isProcessing && styles.voiceDotActive
            ]} />
            <Text style={styles.voiceText}>
              {isProcessing ? 'Processing...' : 'Voice Guidance Active'}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[
            styles.captureButton,
            (cameraQuality.isBlurred || cameraQuality.hasGlare || !cameraQuality.isAligned) && 
            styles.captureButtonDisabled
          ]} 
          onPress={handleCapture}
          disabled={isProcessing || cameraQuality.isBlurred || cameraQuality.hasGlare || !cameraQuality.isAligned}
        >
          <View style={[
            styles.captureButtonInner,
            (cameraQuality.isBlurred || cameraQuality.hasGlare || !cameraQuality.isAligned) && 
            styles.captureButtonInnerDisabled
          ]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBox: {
    width: width * 0.75,
    height: 180,
    borderWidth: 3,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  guideText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  captureButton: {
    position: 'absolute',
    bottom: 60,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  qualityIndicators: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
  },
  qualityGood: {
    borderColor: Theme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  qualityBad: {
    borderColor: Theme.colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  qualityIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  voiceIndicator: {
    position: 'absolute',
    bottom: 160,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  voiceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  voiceDotActive: {
    backgroundColor: Theme.colors.success,
  },
  voiceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInnerDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default CameraView;