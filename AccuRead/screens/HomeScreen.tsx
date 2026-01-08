import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import CameraView from '../components/CameraView';
import ProcessingScreen from '../components/ProcessingScreen';
import ResultCard from '../components/ResultCard';
import { MeterReadingResult, CameraQuality, MeterReading } from '../types';
import { storageService } from '../services/storage';
import { useLocation, useOCREngine, useCameraQuality } from '../hooks';
import { Theme } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  History: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [currentResult, setCurrentResult] = useState<MeterReadingResult | null>(null);
  const [processingMessage, setProcessingMessage] = useState('Processing...');

  const { requestLocation } = useLocation();
  const { processing, error: ocrError, extractReading } = useOCREngine();
  const { isQualityAcceptable, updateQuality } = useCameraQuality();

  const handleCapture = async (imageUri: string) => {
    if (!isQualityAcceptable) {
      Alert.alert('Low Quality', 'Please ensure the reading is clear and well-aligned.');
      return;
    }

    setProcessingMessage('Geotagging...');
    let currentLocation;
    try {
      currentLocation = await requestLocation();
    } catch (error) {
      console.warn('Location access denied');
    }

    setProcessingMessage('Analyzing Meter...');

    try {
      const result = await extractReading(imageUri);
      if (!result) {
        Alert.alert('Analysis Failed', ocrError || 'Could not detect clear digits. Please try again.');
        return;
      }

      const enhancedResult: MeterReadingResult = {
        ...result,
        timestamp: new Date().toISOString(),
        location: currentLocation || undefined,
        imageUrl: imageUri,
      };

      setCurrentResult(enhancedResult);
    } catch (error) {
      Alert.alert('System Error', 'An error occurred while reading the meter.');
      console.error(error);
    }
  };

  const handleQualityChange = (quality: CameraQuality) => {
    updateQuality(quality);
  };

  const handleEditField = (field: keyof MeterReading) => {
    Alert.alert('Manual Override', `Editing ${field} manually.`);
  };

  const handleSubmit = async () => {
    if (!currentResult) return;
    try {
      await storageService.saveReading(currentResult);
      Alert.alert('Encrypted & Saved', 'Metric has been securely stored.', [{ text: 'OK', onPress: () => setCurrentResult(null) }]);
    } catch (error) {
      Alert.alert('Security Violation', 'Failed to encrypt and save the reading.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(30, 58, 138, 0.4)', 'transparent']}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AccuRead</Text>
          <Text style={styles.headerSubtitle}>v1.0 • Secure Analytics</Text>
        </View>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Ionicons name="time" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!currentResult ? (
          <View style={styles.viewport}>
            <CameraView
              onCapture={handleCapture}
              onQualityChange={handleQualityChange}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cameraOverlay}
            />
            <View style={styles.instructions}>
              <Ionicons name="scan-outline" size={32} color={Theme.colors.primary} />
              <Text style={styles.instructionText}>Position digits inside the focus area</Text>
            </View>
          </View>
        ) : (
          <ResultCard
            result={currentResult}
            onEdit={handleEditField}
            onSubmit={handleSubmit}
            onRetake={() => setCurrentResult(null)}
          />
        )}
      </View>

      <ProcessingScreen isVisible={processing} message={processingMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A18',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#60A5FA',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: -2,
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default HomeScreen;