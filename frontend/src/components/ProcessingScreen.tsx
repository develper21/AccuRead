import React from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Theme} from '../utils/theme';

interface ProcessingScreenProps {
  isVisible: boolean;
  message?: string;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  isVisible,
  message = 'Processing...',
}) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(30, 58, 138, 0.95)', 'rgba(17, 24, 39, 0.95)']}
        style={styles.gradient}>
        <View style={styles.content}>
          {/* Radar Scanner Animation */}
          <View style={styles.scannerContainer}>
            <View style={styles.scannerCircle} />
            <View style={styles.scannerLine} />
            <ActivityIndicator
              size="large"
              color={Theme.colors.secondary}
              style={styles.spinner}
            />
          </View>

          {/* Processing Text */}
          <Text style={styles.processingText}>{message}</Text>
          
          {/* Processing Steps */}
          <View style={styles.stepsContainer}>
            <ProcessingStep text="Analyzing image quality..." isActive />
            <ProcessingStep text="Detecting meter display..." />
            <ProcessingStep text="Extracting text..." />
            <ProcessingStep text="Validating readings..." />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

interface ProcessingStepProps {
  text: string;
  isActive?: boolean;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({text, isActive = false}) => (
  <View style={styles.stepContainer}>
    <View
      style={[
        styles.stepDot,
        {backgroundColor: isActive ? Theme.colors.secondary : Theme.colors.textSecondary},
      ]}
    />
    <Text
      style={[
        styles.stepText,
        {color: isActive ? Theme.colors.text : Theme.colors.textSecondary},
      ]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  scannerContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  scannerCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Theme.colors.secondary,
    opacity: 0.3,
  },
  scannerLine: {
    position: 'absolute',
    width: 2,
    height: 70,
    backgroundColor: Theme.colors.secondary,
    opacity: 0.6,
  },
  spinner: {
    transform: [{scale: 1.2}],
  },
  processingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.md,
  },
  stepText: {
    fontSize: 16,
    flex: 1,
  },
});

export default ProcessingScreen;
