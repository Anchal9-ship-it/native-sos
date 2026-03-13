import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Get address from coordinates
    let address = '';
    try {
      const [addressData] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (addressData) {
        address = `${addressData.street || ''}, ${addressData.city || ''}, ${addressData.region || ''}`;
      }
    } catch (err) {
      console.log('Could not get address:', err);
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      address,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const getGoogleMapsLink = (lat: number, lng: number): string => {
  return `https://www.google.com/maps?q=${lat},${lng}`;
};
