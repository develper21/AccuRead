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
} from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { barcodeService, BarcodeData, MeterInfo } from '../services/barcodeService';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../utils/theme';

const BarcodeScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const hasPermission = await barcodeService.requestBarcodePermission();
    setHasPermission(hasPermission);
    
    if (!hasPermission) {
      Alert.alert(
        'Camera Permission Required',
        'Camera permission is required to scan barcodes. Please enable camera permissions in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Settings', 
            onPress: () => Platform.OS === 'ios' 
              ? Linking.openURL('app-settings:') 
              : Linking.openSettings() 
          }
        ]
      );
    }
  };

  const handleBarCodeScanned = useCallback(async ({ type, data }: BarCodeScannerResult) => {
    if (scanned) return;

    // Check if recently scanned to prevent duplicates
    if (barcodeService.isRecentlyScanned(data)) {
      return;
    }

    setScanned(true);
    Vibration.vibrate(100); // Short vibration feedback

    try {
      const barcodeData: BarcodeData = {
        type,
        data,
        timestamp: new Date(),
        format: type,
      };

      // Add to scanning history
      barcodeService.addScannedCode(barcodeData);

      // Parse meter information
      const meterInfo = barcodeService.parseBarcodeData(data);

      if (meterInfo) {
        // Validate serial number if present
        if (meterInfo.serialNumber && !barcodeService.validateMeterSerial(meterInfo.serialNumber)) {
          Alert.alert(
            'Invalid Serial Number',
            'The scanned serial number appears to be invalid. Please check the barcode and try again.',
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
          return;
        }

        // Show success and navigate
        Alert.alert(
          'Meter Information Found',
          `Serial: ${meterInfo.serialNumber || 'Unknown'}\nType: ${meterInfo.meterType || 'Unknown'}\nLocation: ${meterInfo.location || 'Unknown'}`,
          [
            { text: 'Scan Again', onPress: () => setScanned(false) },
            { 
              text: 'Use This Meter', 
              onPress: () => {
                // Navigate back to camera screen with meter info
                navigation.navigate('Camera', { meterInfo });
              }
            }
          ]
        );
      } else {
        // Could not parse meter info
        Alert.alert(
          'Unrecognized Barcode',
          'This barcode does not contain meter information or the format is not supported.',
          [
            { text: 'Scan Again', onPress: () => setScanned(false) },
            { text: 'Use Serial Only', onPress: () => {
              const basicInfo: MeterInfo = { serialNumber: data };
              navigation.navigate('Camera', { meterInfo: basicInfo });
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Barcode scanning error:', error);
      Alert.alert(
        'Scanning Error',
        'An error occurred while processing the barcode. Please try again.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  }, [scanned, navigation]);

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  const showBarcodeHelp = () => {
    barcodeService.showBarcodeHelp();
  };

  const getSupportedTypes = () => {
    return barcodeService.getSupportedBarcodeTypes().map(type => type.name).join(', ');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[
          BarCodeScanner.Constants.BarCodeType.qr,
          BarCodeScanner.Constants.BarCodeType.aztec,
          BarCodeScanner.Constants.BarCodeType.pdf417,
          BarCodeScanner.Constants.BarCodeType.code128,
          BarCodeScanner.Constants.BarCodeType.code39,
          BarCodeScanner.Constants.BarCodeType.ean13,
          BarCodeScanner.Constants.BarCodeType.ean8,
        ]}
        torchEnabled={torchOn}
      />

      {/* Scanner overlay */}
      <View style={styles.overlay}>
        {/* Top overlay */}
        <View style={styles.topOverlay}>
          <Text style={styles.title}>Scan Meter Barcode</Text>
          <Text style={styles.subtitle}>
            Position barcode within the frame
          </Text>
        </View>

        {/* Scanning frame */}
        <View style={styles.scanningFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={toggleTorch}
          >
            <Text style={styles.controlButtonText}>
              {torchOn ? '🔦' : '🔦'}
            </Text>
            <Text style={styles.controlLabel}>
              {torchOn ? 'Flash Off' : 'Flash On'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={showBarcodeHelp}
          >
            <Text style={styles.controlButtonText}>❓</Text>
            <Text style={styles.controlLabel}>Help</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.controlButtonText}>✖️</Text>
            <Text style={styles.controlLabel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanning indicator */}
      {scanned && (
        <View style={styles.scanningIndicator}>
          <Text style={styles.scanningText}>Processing...</Text>
        </View>
      )}

      {/* Info panel */}
      <View style={styles.infoPanel}>
        <Text style={styles.infoText}>
          Supported: {getSupportedTypes()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topOverlay: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  scanningFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginVertical: 40,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Theme.colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 50,
    minWidth: 80,
  },
  controlButtonText: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlLabel: {
    color: '#FFF',
    fontSize: 12,
  },
  scanningIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanningText: {
    color: '#FFF',
    fontSize: 16,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  infoText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default BarcodeScannerScreen;
