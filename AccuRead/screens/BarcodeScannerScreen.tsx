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
    if (scanned) return;

    if (barcodeService.isRecentlyScanned(data)) {
      return;
    }

    setScanned(true);
    Vibration.vibrate(100);

    try {
      const barcodeData: BarcodeData = {
        type,
        data,
        timestamp: new Date(),
        format: type,
      };

      barcodeService.addScannedCode(barcodeData);
      const meterInfo = barcodeService.parseBarcodeData(data);

      if (meterInfo) {
        if (meterInfo.serialNumber && !barcodeService.validateMeterSerial(meterInfo.serialNumber)) {
          Alert.alert(
            'Checksum Error',
            'Numerical sequence mismatch. Verify meter label.',
            [{ text: 'Retry', onPress: () => setScanned(false) }]
          );
          return;
        }

        Alert.alert(
          'Identification Successful',
          `Serial: ${meterInfo.serialNumber || 'N/A'}\nModel: ${meterInfo.meterType || 'Generic'}`,
          [
            { text: 'Discard', style: 'destructive', onPress: () => setScanned(false) },
            {
              text: 'Initialize Analysis',
              onPress: () => {
                navigation.navigate('Home', { meterInfo });
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Manual Entry Required',
          'Data block format unrecognized.',
          [
            { text: 'Retry Search', onPress: () => setScanned(false) },
            {
              text: 'Map Serial Only', onPress: () => {
                const basicInfo: MeterInfo = { serialNumber: data };
                navigation.navigate('Home', { meterInfo: basicInfo });
              }
            }
          ]
        );
      }
    } catch (error) {
      setScanned(false);
    }
  }, [scanned, navigation]);

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
            onPress={() => barcodeService.showBarcodeHelp()}
          >
            <Ionicons name="help-buoy-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {scanned && (
        <View style={styles.statusToast}>
          <Text style={styles.statusText}>Analyzing payload...</Text>
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
});

export default BarcodeScannerScreen;
