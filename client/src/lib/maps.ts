
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
      const errorHandler = (error: GeolocationPositionError) => {
        clearTimeout(timeoutId);
        const errorMessages = {
          1: "Permission denied. Please allow location access in your browser.",
          2: "Position unavailable. Using default location. Try refreshing the page or check if location is enabled in your browser.",
          3: "Request timeout. Please try again."
        };
        console.warn("Geolocation status:", errorMessages[error.code as 1|2|3]);
        resolveSafely(createFallbackPosition());
      };

      // Try high accuracy first, then fall back to low accuracy if needed
      const tryGeolocation = (highAccuracy: boolean) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            if (position?.coords?.latitude && position?.coords?.longitude) {
              console.log("Position obtained:", position.coords);
              resolveSafely(position);
            } else {
              console.warn('Invalid position data. Using fallback.');
              resolveSafely(createFallbackPosition());
            }
          },
          (error) => {
            if (highAccuracy && error.code === error.TIMEOUT) {
              console.log("High accuracy timeout, trying low accuracy...");
              tryGeolocation(false);
            } else {
              errorHandler(error);
            }
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 10000 : 20000,
            maximumAge: 300000
          }
        );
      };

      tryGeolocation(true);
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
