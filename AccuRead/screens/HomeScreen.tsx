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

import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import CameraView from '../components/CameraView';
import ProcessingScreen from '../components/ProcessingScreen';
import ResultCard from '../components/ResultCard';
import { ActionSheetIOS, Platform } from 'react-native';
import { storageService } from '../services/storage';
import { useLocation, useOCREngine, useCameraQuality, useWorklist } from '../hooks';
import { FraudDetectionService } from '../services/fraudDetectionService';
import { TemplateEngineService } from '../services/templateEngine';
import { AnalyticsService } from '../services/analyticsService';
import { ManagerService } from '../services/managerService';
import { GeofencingService } from '../services/geofencingService';
import { TenantService } from '../services/tenantService';
import { SyncService } from '../services/syncService';
import { Theme } from '../utils/theme';
import { MeterReadingResult, CameraQuality, MeterReading, MeterTemplate, TenantConfig, MeterLocation } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { AccessibilityService } from '../services/accessibilityService';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  History: undefined;
};

type HomeScreenRouteParams = {
  meterData?: MeterLocation;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute() as { params?: HomeScreenRouteParams };
  const { isAuthenticated, user } = useAuth();
  const { updateItemStatus } = useWorklist();
  const [currentResult, setCurrentResult] = useState<MeterReadingResult | null>(null);
  const [processingMessage, setProcessingMessage] = useState('Processing...');
  const [templates, setTemplates] = useState<MeterTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<MeterTemplate | undefined>();
  const [currentTenant, setCurrentTenant] = useState<TenantConfig | null>(null);
  const [currentMeterData, setCurrentMeterData] = useState<MeterLocation | null>(null);

  // Get meter data from route params (from worklist)
  React.useEffect(() => {
    if (route.params?.meterData) {
      setCurrentMeterData(route.params.meterData);
    }
  }, [route.params]);

  // Authentication guard - redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to access the camera and meter reading features.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home' as any) }]
      );
      return;
    }
  }, [isAuthenticated, navigation]);

  const { requestLocation } = useLocation();
  const { processing, error: ocrError, extractReading } = useOCREngine();
  const {
    isQualityAcceptable,
    updateQuality,
    voiceMessage,
    shouldTriggerFlash
  } = useCameraQuality();

  // --- Accessibility Voice Guidance (Phase 3) ---
  React.useEffect(() => {
    if (voiceMessage) {
      AccessibilityService.announceGuidance(voiceMessage);
    }
  }, [voiceMessage]);

  React.useEffect(() => {
    const initializeData = async () => {
      // 1. Load Templates
      const available = await TemplateEngineService.getTemplates();
      setTemplates(available);
      setCurrentTemplate(available[0]);

      // 2. Load Tenant (Multi-Tenant Ph2)
      const tenant = await TenantService.getCurrentTenant();
      setCurrentTenant(tenant);

      // 3. Trigger Delta Sync (Phase 2)
      SyncService.syncPendingReadings();
    };
    initializeData();
  }, []);

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
      const result = await extractReading(imageUri, currentTemplate);
      if (!result) {
        Alert.alert('Analysis Failed', ocrError || 'Could not detect clear digits. Please try again.');
        return;
      }

      // --- GEOFENCING CHECK (Ph1 Infrastructure) ---
      if (currentLocation) {
        // Simulate a target meter location for this demo
        const meterLocation = { latitude: currentLocation.latitude + 0.0001, longitude: currentLocation.longitude + 0.0001 };
        const proximity = GeofencingService.checkProximity(
          currentLocation.latitude,
          currentLocation.longitude,
          meterLocation.latitude,
          meterLocation.longitude,
          10 // 10 meter threshold
        );

        if (!proximity.isWithinRange) {
          Alert.alert(
            'Geofence Violation',
            `Capture location is ${proximity.distance.toFixed(1)}m away from the assigned meter. (Limit: 10m)`
          );
          // Optionally block submission if too far
        }
      }

      setProcessingMessage('Security Audit...');
      // Perform Fraud & Tamper Detection
      const securityStatus = await FraudDetectionService.detectFraud(imageUri);

      setProcessingMessage('Predicting Usage...');
      // Perform Predictive Analytics
      const analytics = await AnalyticsService.getConsumerInsights(result);

      const enhancedResult: MeterReadingResult = {
        ...result,
        timestamp: new Date().toISOString(),
        location: currentLocation || undefined,
        imageUrl: imageUri,
        securityStatus: securityStatus,
        analytics: analytics,
        tenantId: currentTenant?.id || 'default',
        isSynced: false,
        lastModified: new Date().toISOString(),
        capturedBy: 'demo-user-123',
      };

      // --- HITL NOTIFICATION ---
      if (enhancedResult.requiresReview) {
        Alert.alert(
          'Supervisor Review Required',
          'Due to low confidence scores, this reading will be sent to the supervisor for verification before finalizing.'
        );
      }

      // --- AUDIT LOG (Managerial Checkpoint) ---
      ManagerService.logAction('METER_CAPTURE', {
        uid: 'demo-user-123',
        email: 'agent.alex@accuread.com',
        name: 'Field Agent Alex',
        role: 'FIELD_WORKER'
      }, {
        meterId: result.data.serialNumber || 'UNKNOWN',
        isOffline: result.isOffline,
        requiresReview: result.requiresReview,
        distanceFromMeter: currentLocation ? GeofencingService.calculateDistance(currentLocation.latitude, currentLocation.longitude, currentLocation.latitude + 0.0001, currentLocation.longitude + 0.0001) : 0
      });

      setCurrentResult(enhancedResult);
    } catch (error) {
      // --- OBSERVABILITY (Managerial Checkpoint) ---
      ManagerService.trackError(error, 'handleCapture');
      Alert.alert('System Error', 'An error occurred while reading the meter.');
      console.error(error);
    }
  };

  const handleQualityChange = (quality: CameraQuality) => {
    updateQuality(quality);
  };

  const handleEditField = (field: keyof MeterReading) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit Value', 'Reset to Default'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Alert.alert('Manual Override', `Editing ${field} manually.`);
          } else if (buttonIndex === 2) {
            Alert.alert('Reset', `${field} reset to default value.`);
          }
        }
      );
    } else {
      Alert.alert('Manual Override', `Editing ${field} manually.`);
    }
  };

  const handleSubmit = async () => {
    if (!currentResult) return;
    try {
      await storageService.saveReading(currentResult);
      
      // Update worklist status if this reading was from worklist
      if (currentMeterData) {
        const worklistItemId = `WL-${currentMeterData.meterId}`;
        await updateItemStatus(worklistItemId, 'COMPLETED', `Reading completed: ${currentResult.data.kwh} kWh`);
        
        Alert.alert(
          'Reading Completed & Saved',
          `Meter reading for ${currentMeterData.consumerName} has been completed and saved.`,
          [{ 
            text: 'OK', 
            onPress: () => {
              setCurrentResult(null);
              setCurrentMeterData(null);
              // Navigate back to worklist
              navigation.navigate('worklist' as any);
            }
          }]
        );
      } else {
        Alert.alert('Encrypted & Saved', 'Metric has been securely stored.', [{ text: 'OK', onPress: () => setCurrentResult(null) }]);
      }

      // Sync with storage service for backup
      const allReadings = await storageService.getAllReadings();
      console.log(`Total readings in storage: ${allReadings.length}`);
      
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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => {
              if (templates.length > 1) {
                const currentIndex = templates.findIndex(t => t.id === currentTemplate?.id);
                const nextIndex = (currentIndex + 1) % templates.length;
                setCurrentTemplate(templates[nextIndex]);
                Alert.alert('Template Changed', `Switched to ${templates[nextIndex].name}`);
              }
            }}
          >
            <Ionicons name="layers" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('History')}
          >
            <Ionicons name="time" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Meter Info (when from worklist) */}
      {currentMeterData && (
        <View style={styles.currentMeterInfo}>
          <View style={styles.meterInfoHeader}>
            <Ionicons name="location" size={20} color={Theme.colors.primary} />
            <Text style={styles.meterInfoTitle}>Current Assignment</Text>
          </View>
          <Text style={styles.consumerName}>{currentMeterData.consumerName}</Text>
          <Text style={styles.meterAddress}>{currentMeterData.address}</Text>
          <View style={styles.meterDetails}>
            <Text style={styles.meterDetail}>Meter: {currentMeterData.meterNumber}</Text>
            <Text style={styles.meterDetail}>Consumer: {currentMeterData.consumerNumber}</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {!currentResult ? (
          <View style={styles.viewport}>
            {isAuthenticated ? (
              <>
                <CameraView
                  onCapture={handleCapture}
                  onQualityChange={handleQualityChange}
                  autoFlash={shouldTriggerFlash}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.cameraOverlay}
                />
                <View style={styles.instructions}>
                  <Ionicons name="scan-outline" size={32} color={Theme.colors.primary} />
                  <Text style={styles.instructionText}>Position digits inside the focus area</Text>
                </View>
              </>
            ) : (
              <View style={styles.authRequiredContainer}>
                <Ionicons name="lock-closed" size={48} color={Theme.colors.primary} />
                <Text style={styles.authRequiredTitle}>Authentication Required</Text>
                <Text style={styles.authRequiredText}>Please sign in to access camera features</Text>
              </View>
            )}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    width: width - 32,
    alignSelf: 'center',
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
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  authRequiredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  authRequiredText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  currentMeterInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  meterInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  meterInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  consumerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  meterAddress: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 8,
  },
  meterDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  meterDetail: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
});

export default HomeScreen;