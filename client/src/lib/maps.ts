// Type definition for mosque data
export interface Mosque {
  id: number;
  name: string;
  address: string;
  city: string;
  contactNumber?: string;
  email: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  additionalImages: string[];
  isVerified: boolean;
  createdBy?: number;
  hasWomensSection: boolean;
  hasAccessibleEntrance: boolean;
  hasParking: boolean;
  hasWuduFacilities: boolean;
  hasQuranClasses: boolean;
  hasCommunityHall: boolean;
  createdAt: string | Date;
  distance?: number;
}

// Type definition for prayer times
export interface MosquePrayerTimes {
  id: number;
  mosqueId: number;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummuah?: string;
  fajrDays: string;
  dhuhrDays: string;
  asrDays: string;
  maghribDays: string;
  ishaDays: string;
  updatedAt: string | Date;
}

// Default coordinates for New York (Central Park) to use as fallback
export const DEFAULT_LATITUDE = 40.785091;
export const DEFAULT_LONGITUDE = -73.968285;

export interface FallbackPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

// Get user's current position
export const getCurrentPosition = (): Promise<GeolocationPosition | FallbackPosition> => {
  return new Promise((resolve) => {
    // Create a fallback position (New York City)
    const createFallbackPosition = (): FallbackPosition => {
      return {
        coords: {
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          accuracy: 1000,
        },
        timestamp: Date.now(),
      };
    };

    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser. Using fallback position.');
      resolve(createFallbackPosition());
    } else {
      // Set a timeout in case geolocation takes too long
      const timeoutId = setTimeout(() => {
        console.warn('Geolocation timed out. Using fallback position.');
        resolve(createFallbackPosition());
      }, 5000);

      const successCallback = (position: GeolocationPosition) => {
        clearTimeout(timeoutId);
        console.log("Position successfully obtained:", position.coords);
        resolve(position);
      };

      const errorCallback = (error: GeolocationPositionError) => {
        clearTimeout(timeoutId);
        console.error("Geolocation error:", error.code, error.message);
        // Use fallback for any error (permission denied, position unavailable, timeout)
        console.warn('Using fallback position due to geolocation error.');
        resolve(createFallbackPosition());
      };

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  });
};

// Get location name from coordinates
export const getLocationName = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // In a real app, you would use a service like Google Maps Geocoding API
    // For this example, we'll just return a placeholder
    return "Current Location";
  } catch (error) {
    console.error('Error getting location name:', error);
    return "Unknown Location";
  }
};

// Format distance for display
export const formatDistance = (distanceInKm?: number): string => {
  if (distanceInKm === undefined) return '';

  if (distanceInKm < 1) {
    // Convert to meters and round
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} m`;
  }

  // Round to one decimal place
  return `${distanceInKm.toFixed(1)} km`;
};