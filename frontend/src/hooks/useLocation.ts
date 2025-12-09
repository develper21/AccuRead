import {useState, useCallback} from 'react';
import {Platform, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation-service';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<Location | null>;
  hasLocationPermission: boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('always');
    }
    
    return new Promise((resolve) => {
      Geolocation.requestAuthorization(
        () => {
          setHasLocationPermission(true);
          resolve(true);
        },
        () => {
          setHasLocationPermission(false);
          resolve(false);
        },
      );
    });
  }, []);

  const getCurrentLocation = useCallback((): Promise<Location | null> => {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position: any) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          resolve(newLocation);
        },
        (locationError: any) => {
          let errorMessage = 'Failed to get location';
          
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
            default:
              errorMessage = 'Unknown location error';
              break;
          }
          
          setErrorState(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }, []);

  const requestLocation = useCallback(async (): Promise<Location | null> => {
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
