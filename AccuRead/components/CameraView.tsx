import React, { useState, useEffect, useRef } from 'react';
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

const { width } = Dimensions.get('window');

interface CameraViewProps {
  onCapture: (imageUri: string) => void;
  onQualityChange: (quality: CameraQuality) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onQualityChange }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraQuality] = useState<CameraQuality>({
    isBlurred: false,
    hasGlare: false,
    isAligned: false,
    brightness: 0,
    sharpness: 0,
  });

  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const pulseAnimation = useRef(new Animated.Value(1)).current;

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

  // Frame processor for real-time quality checking
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    runAtTargetFps(5, () => {
      'worklet';
      // Signal quality check back to UI thread
      // For now we mock it as calling a function on UI thread is complex in V4 without worklets-core correctly setup
    });
  }, []);

  const handleCapture = async () => {
    if (camera.current) {
      try {
        const photo = await camera.current.takePhoto({
          //@ts-ignore
          qualityPrioritization: 'quality',
          flash: 'off',
        });
        onCapture(`file://${photo.path}`);
      } catch (error) {
        console.error('Error capturing photo:', error);
        Alert.alert('Error', 'Failed to capture photo');
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
        <Animated.View
          style={[
            styles.guideBox,
            {
              transform: [{ scale: pulseAnimation }],
              borderColor: cameraQuality.isAligned
                ? Theme.colors.success
                : '#3B82F6',
            },
          ]}>
          <Text style={styles.guideText}>
            {cameraQuality.isAligned ? 'Ready' : 'Align meter within frame'}
          </Text>
        </Animated.View>

        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
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
});

export default CameraView;