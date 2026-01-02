import React, {useState} from 'react';
import {View, StyleSheet, Alert, TouchableOpacity, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import CameraView from '../components/CameraView';
import ProcessingScreen from '../components/ProcessingScreen';
import ResultCard from '../components/ResultCard';
import {MeterReadingResult, CameraQuality, MeterReading} from '../types';
import {storageService} from '../services/storage';
import {useLocation, useOCREngine, useCameraQuality} from '../hooks';
import {Theme} from '../utils/theme';

type RootStackParamList = {
  Home: undefined;
  History: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [currentResult, setCurrentResult] = useState<MeterReadingResult | null>(null);
  const [processingMessage, setProcessingMessage] = useState('Processing...');

  // Custom hooks
  const {requestLocation} = useLocation();
  const {processing, error: ocrError, extractReading} = useOCREngine();
  const {isQualityAcceptable, updateQuality} = useCameraQuality();

  const handleCapture = async (imageUri: string) => {
    if (!isQualityAcceptable) {
      Alert.alert('Poor Quality', 'Please improve image quality before capturing.');
      return;
    }

    setProcessingMessage('Getting location...');
    
    // Get current location
    let currentLocation;
    try {
      currentLocation = await requestLocation();
    } catch (error) {
      console.warn('Location access denied:', error);
    }

    setProcessingMessage('Extracting meter reading...');

    try {
      // Call OCR processing
      const result = await extractReading(imageUri);
      
      if (!result) {
        Alert.alert('Error', ocrError || 'Failed to process image');
        return;
      }
      
      // Add location and timestamp
      const enhancedResult: MeterReadingResult = {
        ...result,
        timestamp: new Date().toISOString(),
        location: currentLocation || undefined,
        imageUrl: imageUri,
      };

      setCurrentResult(enhancedResult);
    } catch (error) {
      Alert.alert('Error', 'Failed to process image. Please try again.');
      console.error('Processing error:', error);
    }
  };

  const handleQualityChange = (quality: CameraQuality) => {
    updateQuality(quality);
    
    // Show warnings for poor quality
    const warnings = [];
    if (quality.isBlurred) warnings.push('Hold Steady');
    if (quality.hasGlare) warnings.push('Adjust Angle');
    if (!quality.isAligned) warnings.push('Align with Guide');
    
    // You could show these warnings in the UI
    console.log('Quality warnings:', warnings);
  };

  const handleEditField = (field: keyof MeterReading) => {
    // In a real implementation, this would open an edit modal
    Alert.alert('Edit Field', `Edit ${field} functionality would be implemented here`);
  };

  const handleSubmit = async () => {
    if (!currentResult) return;

    try {
      // Save to local storage
      await storageService.saveReading(currentResult);
      
      Alert.alert(
        'Success',
        'Meter reading saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => setCurrentResult(null),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save reading. Please try again.');
      console.error('Save error:', error);
    }
  };

  const handleRetake = () => {
    setCurrentResult(null);
  };

  return (
    <View style={styles.container}>
      {/* Header with History Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AccuRead</Text>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      {!currentResult ? (
        <CameraView
          onCapture={handleCapture}
          onQualityChange={handleQualityChange}
        />
      ) : (
        <ResultCard
          result={currentResult}
          onEdit={handleEditField}
          onSubmit={handleSubmit}
          onRetake={handleRetake}
        />
      )}
      
      <ProcessingScreen isVisible={processing} message={processingMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  historyButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  historyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen;