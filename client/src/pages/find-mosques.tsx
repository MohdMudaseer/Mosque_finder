import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import MosqueCard from "@/components/mosque/MosqueCard";
import MosqueMap from "@/components/mosque/MosqueMap";
import SearchFilters from "@/components/mosque/SearchFilters";
import { Mosque, MosquePrayerTimes, getCurrentPosition } from "@/lib/maps";
import { useToast } from "@/hooks/use-toast";

const FindMosques = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [filteredMosques, setFilteredMosques] = useState<Mosque[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    hasJummuah: false,
    hasWomensSection: false,
    hasEvents: false,
    isAccessible: false
  });

  // Fetch mosques near the user's location
  const { data: mosques, isLoading, error, refetch } = useQuery({
    queryKey: [userLocation ? `/api/mosques?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${searchRadius}` : '/api/mosques'],
    enabled: !!userLocation,
  });

  // Fetch prayer times for all mosques
  const { data: prayerTimesMap } = useQuery({
    queryKey: ['/api/prayer-times-map'],
    queryFn: async () => {
      if (!mosques || mosques.length === 0) return {};
      
      const prayerTimesMap: Record<number, MosquePrayerTimes> = {};
      
      for (const mosque of mosques) {
        try {
          const response = await fetch(`/api/mosques/${mosque.id}/prayer-times`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const prayerTimes = await response.json();
            prayerTimesMap[mosque.id] = prayerTimes;
          }
        } catch (error) {
          console.error(`Failed to fetch prayer times for mosque ${mosque.id}:`, error);
        }
      }
      
      return prayerTimesMap;
    },
    enabled: !!mosques && mosques.length > 0,
  });

  useEffect(() => {
    // Get user's location on component mount
    handleGetLocation();
  }, []);

  useEffect(() => {
    if (mosques) {
      applyFilters(mosques);
    }
  }, [mosques, searchFilters]);

  const handleGetLocation = async () => {
    try {
      const position = await getCurrentPosition();
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      
      toast({
        title: "Location Found",
        description: "Showing mosques near your current location.",
      });
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Using Default Location",
        description: "Unable to get your location. Using New York as default location.",
      });
      
      // Use default coordinates for New York as fallback
      setUserLocation({
        lat: 40.7589,
        lng: -73.9851
      });
    }
  };

  const handleSearch = (filters: {
    location: string;
    radius: number;
    filters: {
      hasJummuah: boolean;
      hasWomensSection: boolean;
      hasEvents: boolean;
      isAccessible: boolean;
    }
  }) => {
    setSearchRadius(filters.radius);
    setSearchFilters(filters.filters);
    
    // Update search parameters and refetch
    if (userLocation) {
      refetch();
    }
  };

  const applyFilters = (mosques: Mosque[]) => {
    let filtered = [...mosques];
    
    if (searchFilters.hasWomensSection) {
      filtered = filtered.filter(mosque => mosque.hasWomensSection);
    }
    
    if (searchFilters.isAccessible) {
      filtered = filtered.filter(mosque => mosque.hasAccessibleEntrance);
    }
    
    // Other filters could be applied here if we had that data
    
    setFilteredMosques(filtered);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <SearchFilters onSearch={handleSearch} onGetLocation={handleGetLocation} />
          </div>
          
          <div className="w-full md:w-2/3">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {isLoading ? 'Finding mosques...' : 
                  filteredMosques.length === 0 ? 'No mosques found' : 
                  `${filteredMosques.length} Mosques Found`}
              </h3>
              <div className="flex gap-2">
                <button 
                  className={`p-2 ${viewMode === 'list' ? 'text-primary' : 'text-neutral-dark/70 hover:text-primary'} bg-neutral-light rounded`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
                <button 
                  className={`p-2 ${viewMode === 'map' ? 'text-primary' : 'text-neutral-dark/70 hover:text-primary'} bg-neutral-light rounded`}
                  onClick={() => setViewMode('map')}
                >
                  <i className="fas fa-map-marker-alt"></i>
                </button>
              </div>
            </div>
            
            {userLocation && viewMode === 'map' && (
              <MosqueMap 
                mosques={filteredMosques || []} 
                userLocation={userLocation}
              />
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl mb-3"></i>
                  <p className="text-neutral-dark/70">Searching for mosques near you...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  <p>Error loading mosques. Please try again.</p>
                </div>
                <Button 
                  onClick={() => refetch()} 
                  variant="outline" 
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            ) : filteredMosques.length === 0 ? (
              <div className="bg-neutral-light p-8 rounded-lg text-center">
                <i className="fas fa-mosque text-primary text-4xl mb-4"></i>
                <h3 className="font-heading text-xl font-bold mb-2">No Mosques Found</h3>
                <p className="text-neutral-dark/70 mb-4">
                  We couldn't find any mosques matching your criteria.
                </p>
                <Button onClick={() => {
                  setSearchFilters({
                    hasJummuah: false,
                    hasWomensSection: false,
                    hasEvents: false,
                    isAccessible: false
                  });
                  refetch();
                }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                {filteredMosques.map((mosque) => (
                  prayerTimesMap && prayerTimesMap[mosque.id] ? (
                    <MosqueCard 
                      key={mosque.id} 
                      mosque={mosque} 
                      prayerTimes={prayerTimesMap[mosque.id]} 
                    />
                  ) : null
                ))}
                
                {filteredMosques.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" className="bg-white hover:bg-neutral-light transition-colors border border-gray-300 rounded-lg px-4 py-2 text-neutral-dark font-medium">
                      Load More Mosques
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindMosques;
