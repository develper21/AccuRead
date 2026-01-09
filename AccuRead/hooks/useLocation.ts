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

import {useState, useCallback, useEffect} from 'react';
import {Platform, Alert} from 'react-native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationData | null>;
  hasLocationPermission: boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Check initial permission status on mount
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const hasPermission = status === 'granted';
        setHasLocationPermission(hasPermission);
      } catch (error) {
        console.error('Error checking initial permission:', error);
        setHasLocationPermission(false);
      }
    };
    
    checkInitialPermission();
  }, []);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      // Platform-specific permission handling
      if (Platform.OS === 'ios') {
        // iOS may need background location permission for field work
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        const hasPermission = status === 'granted' && backgroundStatus.status === 'granted';
        setHasLocationPermission(hasPermission);
        return hasPermission;
      } else {
        // Android specific handling
        const hasPermission = status === 'granted';
        setHasLocationPermission(hasPermission);
        return hasPermission;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      setHasLocationPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      // Platform-specific accuracy settings
      const accuracy = Platform.OS === 'ios' 
        ? Location.Accuracy.BestForNavigation 
        : Location.Accuracy.High;
      
      const position = await Location.getCurrentPositionAsync({
        accuracy,
        // Android specific options
        ...(Platform.OS === 'android' && {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }),
      });
      
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setLocation(newLocation);
      return newLocation;
    } catch (locationError: any) {
      let errorMessage = 'Failed to get location';
      
      // Platform-specific error codes
      if (Platform.OS === 'ios') {
        switch (locationError.code) {
          case 1:
            errorMessage = 'Location permission denied';
            break;
          case 2:
            errorMessage = 'Location unavailable';
            break;
          case 3:
            errorMessage = 'Location request timeout';
            break;
        }
      } else {
        // Android error codes
        switch (locationError.code) {
          case 1:
            errorMessage = 'Location permission denied';
            break;
          case 2:
            errorMessage = 'Location services disabled';
            break;
          case 3:
            errorMessage = 'Location request timeout';
            break;
        }
      }
      
      setErrorState(errorMessage);
      return null;
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setErrorState(null);

    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setErrorState('Location permission denied');
        setLoading(false);
        return null;
      }

      const currentLocation = await getCurrentLocation();
      
      if (!currentLocation) {
        // Show platform-specific alert for manual location permission
        Alert.alert(
          'Location Required',
          Platform.OS === 'ios' 
            ? 'Please enable location services in Settings > Privacy > Location Services for accurate meter reading geotagging.'
            : 'Please enable location services for accurate meter reading geotagging.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Settings', 
              onPress: () => {
                // Platform-specific settings opening
                if (Platform.OS === 'ios') {
                  console.log('Open iOS Settings');
                  // In a real app: Linking.openURL('app-settings:');
                } else {
                  console.log('Open Android Settings');
                  // In a real app: Linking.openSettings();
                }
              }
            },
          ],
          { cancelable: false }
        );
      }

      setLoading(false);
      return currentLocation;
    } catch {
      setErrorState('Failed to get location');
      setLoading(false);
      return null;
    }
  }, [requestLocationPermission, getCurrentLocation]);

  return {
    location,
    loading,
    error: errorState,
    requestLocation,
    hasLocationPermission,
  };
};
