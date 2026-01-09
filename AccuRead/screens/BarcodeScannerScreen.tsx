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

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Linking,
  Platform,
  SafeAreaView,
} from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { barcodeService, BarcodeData, MeterInfo } from '../services/barcodeService';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BarcodeScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [barcodeData, setBarcodeData] = useState<BarcodeData | null>(null);
  const [meterInfo, setMeterInfo] = useState<MeterInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const hasPermission = await barcodeService.requestBarcodePermission();
    setHasPermission(hasPermission);

    if (!hasPermission) {
      Alert.alert(
        'Protocol Required',
        'Camera access is essential for meter identification. Enable in settings?',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'System Settings',
            onPress: () => Platform.OS === 'ios'
              ? Linking.openURL('app-settings:')
              : Linking.openSettings()
          }
        ]
      );
    }
  };

  const handleBarCodeScanned = useCallback(async ({ type, data }: BarCodeScannerResult) => {
    if (scanned || isProcessing) return;

    if (barcodeService.isRecentlyScanned(data)) {
      setError('This code was recently scanned. Please wait.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setScanned(true);
    setIsProcessing(true);
    setError(null);
    Vibration.vibrate(100);

    try {
      const newBarcodeData: BarcodeData = {
        type,
        data,
        timestamp: new Date(),
        format: type,
      };

      setBarcodeData(newBarcodeData);
      barcodeService.addScannedCode(newBarcodeData);
      
      const parsedMeterInfo = barcodeService.parseBarcodeData(data);
      setMeterInfo(parsedMeterInfo);

      if (parsedMeterInfo) {
        if (parsedMeterInfo.serialNumber && !barcodeService.validateMeterSerial(parsedMeterInfo.serialNumber)) {
          setError('Checksum Error: Numerical sequence mismatch. Verify meter label.');
          setTimeout(() => {
            setError(null);
            setScanned(false);
            setIsProcessing(false);
          }, 3000);
          return;
        }

        // Success - valid meter found
        setTimeout(() => {
          setScanned(false);
          setIsProcessing(false);
        }, 2000);
      } else {
        // Invalid format
        setError('Data block format unrecognized.');
        setTimeout(() => {
          setError(null);
          setScanned(false);
          setIsProcessing(false);
        }, 3000);
      }
    } catch (error) {
      setError('Failed to process barcode. Please try again.');
      setScanned(false);
      setIsProcessing(false);
    }
  }, [scanned, isProcessing]);

  if (hasPermission === null || hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          {hasPermission === null ? 'Initializing optical sensors...' : 'Sensor access denied.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.overlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.topSection}
        >
          <Text style={styles.title}>Scan Identifier</Text>
          <Text style={styles.subtitle}>Compatible with QR, Aztec, and Linear codes</Text>
        </LinearGradient>

        <View style={styles.focusFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Theme.colors.primary }]}
            onPress={() => setShowHelp(true)}
          >
            <Ionicons name="help-buoy-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {barcodeData && (
        <View style={styles.barcodeInfo}>
          <Text style={styles.barcodeLabel}>Scanned Data:</Text>
          <Text style={styles.barcodeValue}>{barcodeData.data}</Text>
          <Text style={styles.barcodeType}>Type: {barcodeData.type}</Text>
          <Text style={styles.barcodeTime}>
            {barcodeData.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      )}

      {scanned && (
        <View style={styles.statusToast}>
          <Text style={styles.statusText}>
            {isProcessing ? 'Analyzing payload...' : 'Processing complete'}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              setError(null);
              setScanned(false);
              setIsProcessing(false);
            }}
          >
            <Text style={styles.errorButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {meterInfo && !error && (
        <View style={styles.successToast}>
          <Text style={styles.successText}>
            ✓ {meterInfo.serialNumber || 'Meter Identified'}
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => {
              navigation.navigate('Home', { meterInfo });
              setScanned(false);
              setIsProcessing(false);
            }}
          >
            <Text style={styles.successButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Help Modal */}
      {showHelp && (
        <View style={styles.modalOverlay}>
          <View style={styles.helpModal}>
            <View style={styles.helpHeader}>
              <Text style={styles.helpTitle}>Scanning Help</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHelp(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.helpContent}>
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Supported Formats:</Text>
                {'\n• QR Codes\n• Aztec Codes\n• Linear Barcodes\n• Data Matrix'}
              </Text>
              
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Tips:</Text>
                {'\n• Ensure good lighting\n• Hold camera 6-12 inches away\n• Keep code flat and steady\n• Clean dirty or damaged labels'}
              </Text>
              
              <Text style={styles.helpText}>
                <Text style={styles.helpBold}>Troubleshooting:</Text>
                {'\n• Check camera permissions\n• Clean camera lens\n• Restart app if issues persist'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.helpCloseButton}
              onPress={() => setShowHelp(false)}
            >
              <Text style={styles.helpCloseButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 120,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  focusFrame: {
    width: 280,
    height: 280,
    alignSelf: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3B82F6',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 15,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 15,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 15,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 15,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 60,
    gap: 20,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusToast: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -25 }],
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontWeight: '700',
  },
  errorToast: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: 280,
  },
  errorText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  successToast: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: 280,
  },
  successText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  successButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 320,
    width: '90%',
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  helpContent: {
    marginBottom: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpBold: {
    fontWeight: '600',
    color: '#333',
  },
  helpCloseButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  helpCloseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  barcodeInfo: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 12,
    borderRadius: 8,
  },
  barcodeLabel: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  barcodeValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  barcodeType: {
    fontSize: 12,
    color: '#FFF',
    marginBottom: 4,
  },
  barcodeTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default BarcodeScannerScreen;
