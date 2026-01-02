import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Camera, useCameraDevices, useFrameProcessor} from 'react-native-vision-camera';
import {CameraQuality} from '../types';
import {Theme} from '../utils/theme';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const {width, height} = Dimensions.get('window');

interface CameraViewProps {
  onCapture: (imageUri: string) => void;
  onQualityChange: (quality: CameraQuality) => void;
}

const CameraView: React.FC<CameraViewProps> = ({onCapture, onQualityChange}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [cameraQuality, setCameraQuality] = useState<CameraQuality>({
    isBlurred: false,
    hasGlare: false,
    isAligned: false,
    brightness: 0,
    sharpness: 0,
  });

  const devices = useCameraDevices();
  const device = devices.back;
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
  }, []);

  // Simple quality detection (mock implementation)
  const checkQuality = () => {
    // In real implementation, this would analyze the camera frame
    const quality: CameraQuality = {
      isBlurred: Math.random() > 0.8, // Mock detection
      hasGlare: Math.random() > 0.9, // Mock detection
      isAligned: Math.random() > 0.2, // Mock detection
      brightness: Math.random() * 100,
      sharpness: Math.random() * 100,
    };
    
    setCameraQuality(quality);
    onQualityChange(quality);
  };

  // Frame processor for real-time quality checking
  const frameProcessor = useFrameProcessor((frame: any) => {
    'worklet';
    // Add real-time quality detection here
    checkQuality();
  }, []);

  const handleCapture = async () => {
    if (camera.current) {
      try {
        const photo = await camera.current.takePhoto({
          qualityPrioritization: 'quality',
          flash: 'off',
        });
        onCapture(photo.path);
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
        isActive={isActive}
        photo={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />

      {/* AR Overlay Guide Box */}
      <View style={styles.overlayContainer}>
        <Animated.View
          style={[
            styles.guideBox,
            {
              transform: [{scale: pulseAnimation}],
              borderColor: cameraQuality.isAligned 
                ? Theme.colors.success 
                : Theme.colors.secondary,
            },
          ]}>
          <Text style={styles.guideText}>
            {cameraQuality.isAligned ? 'Ready' : 'Align meter here'}
          </Text>
        </Animated.View>

        {/* Quality Indicators */}
        <View style={styles.qualityContainer}>
          {cameraQuality.isBlurred && (
            <View style={styles.qualityWarning}>
              <Text style={styles.warningText}>Hold Steady</Text>
            </View>
          )}
          {cameraQuality.hasGlare && (
            <View style={styles.qualityWarning}>
              <Text style={styles.warningText}>Adjust Angle</Text>
            </View>
          )}
        </View>

        {/* Capture Button */}
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
    width: width * 0.7,
    height: height * 0.3,
    borderWidth: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  qualityContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  qualityWarning: {
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CameraView;