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
    let isResolved = false;
    
    const createFallbackPosition = (): FallbackPosition => ({
      coords: {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        accuracy: 1000,
      },
      timestamp: Date.now(),
    });

    const resolveSafely = (position: GeolocationPosition | FallbackPosition) => {
      if (!isResolved) {
        isResolved = true;
        resolve(position);
      }
    };

    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported. Using fallback position.');
      resolveSafely(createFallbackPosition());
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn('Geolocation request timed out. Using fallback position.');
      resolveSafely(createFallbackPosition());
    }, 5000);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          if (position && position.coords) {
            console.log("Position obtained:", position.coords);
            resolveSafely(position);
          } else {
            console.warn('Invalid position data. Using fallback.');
            resolveSafely(createFallbackPosition());
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.error("Geolocation error:", error.code, error.message);
          resolveSafely(createFallbackPosition());
        },
        {
          enableHighAccuracy: false, // Set to false for faster response
          timeout: 5000,
          maximumAge: 60000 // Cache position for 1 minute
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Unexpected geolocation error:", error);
      resolveSafely(createFallbackPosition());
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