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
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    // First try with high accuracy
    const tryGeolocation = (highAccuracy: boolean) => {
      const timeoutId = setTimeout(() => {
        if (highAccuracy) {
          console.log("Trying with lower accuracy...");
          tryGeolocation(false);
        } else {
          reject(new Error('Location request timed out. Please try again.'));
        }
      }, highAccuracy ? 5000 : 10000);

      const successHandler = (position: GeolocationPosition) => {
        clearTimeout(timeoutId);
        if (position?.coords?.latitude && position?.coords?.longitude) {
          console.log("Position obtained:", position.coords);
          resolve(position);
        } else {
          reject(new Error('Invalid position data received'));
        }
      };

      const errorHandler = (error: GeolocationPositionError) => {
        clearTimeout(timeoutId);
        if (highAccuracy && error.code === error.TIMEOUT) {
          console.log("High accuracy timeout, trying with lower accuracy...");
          tryGeolocation(false);
          return;
        }

        const errorMessages = {
          1: "Location access denied. Please allow location access in your browser settings and try again.",
          2: "Unable to determine your location. Please make sure you have GPS enabled and try again.",
          3: "Location request timed out. Please check your connection and try again."
        };
        reject(new Error(errorMessages[error.code as 1|2|3]));
      };

      navigator.geolocation.getCurrentPosition(
        successHandler,
        errorHandler,
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 5000 : 10000,
          maximumAge: highAccuracy ? 0 : 60000
        }
      );
    };

    // Start with high accuracy first
    tryGeolocation(true);
  });
};

// Get location name from coordinates
export const getLocationName = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
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
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} m`;
  }

  return `${distanceInKm.toFixed(1)} km`;
};
