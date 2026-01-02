import {useState, useCallback} from 'react';
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

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setLocation(newLocation);
      return newLocation;
    } catch (locationError: any) {
      let errorMessage = 'Failed to get location';
      
      if (locationError.code === 1) {
        errorMessage = 'Location permission denied';
      } else if (locationError.code === 2) {
        errorMessage = 'Location unavailable';
      } else if (locationError.code === 3) {
        errorMessage = 'Location request timeout';
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
        // Show alert for manual location permission
        Alert.alert(
          'Location Required',
          'Please enable location services for accurate meter reading geotagging.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Settings', onPress: () => {
              // In a real app, you would open app settings
              console.log('Open app settings');
            }},
          ],
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
