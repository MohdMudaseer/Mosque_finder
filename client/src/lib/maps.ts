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

// Get user's current position
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
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
