import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PrayerTimesCard from "@/components/mosque/PrayerTimesCard";
import { getCurrentPosition, getLocationName } from "@/lib/maps";
import { getCurrentPrayerTimes, PrayerTimesData } from "@/lib/prayerTimes";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const { toast } = useToast();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [location, setLocation] = useState<string>("Loading...");
  const [date, setDate] = useState<string>(new Date().toLocaleDateString("en-US", {
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  }));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPrayerTimes() {
      try {
        setLoading(true);
        
        try {
          // Get user's current position
          const position = await getCurrentPosition();
          
          // Get location name
          const locationName = await getLocationName(
            position.coords.latitude,
            position.coords.longitude
          );
          setLocation(locationName);
          
          // Get prayer times
          const times = await getCurrentPrayerTimes(
            position.coords.latitude,
            position.coords.longitude
          );
          setPrayerTimes(times);
        } catch (geoError) {
          console.error('Geolocation error:', geoError);
          
          // Use default coordinates for New York as fallback
          const defaultLat = 40.7589;
          const defaultLng = -73.9851;
          
          setLocation("New York (Default)");
          
          // Get prayer times for default location
          const times = await getCurrentPrayerTimes(defaultLat, defaultLng);
          setPrayerTimes(times);
        }
      } catch (error) {
        console.error('Error loading prayer times:', error);
        toast({
          title: "Error",
          description: "Could not load prayer times. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadPrayerTimes();
  }, [toast]);

  return (
    <>
      {/* Hero Section */}
      <section className="pattern-bg bg-white py-12 md:py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-neutral-dark">
            Find Nearby Mosques & Prayer Times
          </h2>
          <p className="text-lg md:text-xl mb-8 text-neutral-dark/80 max-w-2xl mx-auto">
            Discover mosques around you with accurate prayer times, events, and more.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
            <Link href="/find-mosques">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md w-full md:w-auto">
                <i className="fas fa-mosque mr-2"></i>Find Nearby Mosques
              </Button>
            </Link>
            <Link href="/register-mosque">
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md w-full md:w-auto">
                <i className="fas fa-user-plus mr-2"></i>Register Your Mosque
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="relative mt-8 max-w-sm mx-auto md:max-w-md">
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white">
                <div className="bg-primary/10 p-4 border-b border-gray-200">
                  <h3 className="font-heading font-bold text-xl text-primary">Loading Prayer Times</h3>
                  <p className="text-sm text-neutral-dark/70">Fetching current location...</p>
                </div>
                <div className="p-4 flex justify-center items-center py-8">
                  <div className="flex flex-col items-center">
                    <i className="fas fa-spinner fa-spin text-primary text-2xl mb-3"></i>
                    <p className="text-neutral-dark/70">Please wait while we load prayer times</p>
                  </div>
                </div>
              </div>
            </div>
          ) : prayerTimes ? (
            <PrayerTimesCard 
              prayerTimes={prayerTimes} 
              location={location} 
              date={date} 
            />
          ) : (
            <div className="relative mt-8 max-w-sm mx-auto md:max-w-md">
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white">
                <div className="bg-primary/10 p-4 border-b border-gray-200">
                  <h3 className="font-heading font-bold text-xl text-primary">Prayer Times Unavailable</h3>
                </div>
                <div className="p-4 text-center py-8">
                  <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-3"></i>
                  <p className="text-neutral-dark/70 mb-4">We couldn't load prayer times for your location.</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">How MosqueTime Helps</h2>
            <p className="text-lg max-w-2xl mx-auto">Connecting worshippers to mosques and accurate prayer times with ease.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-light rounded-lg p-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-mosque text-primary text-2xl"></i>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Find Nearby Mosques</h3>
              <p className="text-neutral-dark/80">Easily locate mosques near you with accurate directions and details.</p>
            </div>
            
            <div className="bg-neutral-light rounded-lg p-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-primary text-2xl"></i>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Accurate Prayer Times</h3>
              <p className="text-neutral-dark/80">Get precise prayer timings directly from local mosques.</p>
            </div>
            
            <div className="bg-neutral-light rounded-lg p-6 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bullhorn text-primary text-2xl"></i>
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Special Events</h3>
              <p className="text-neutral-dark/80">Stay updated with mosque events like Shab-e-Meraj, Shab-e-Qadr and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Promo Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="font-heading text-3xl font-bold mb-4">Download the MosqueTime App</h2>
              <p className="text-lg mb-6">Take MosqueTime with you wherever you go. Download our app for iOS and Android to access prayer times and find mosques on the move.</p>
              
              <div className="flex flex-wrap gap-4">
                <a href="#" className="bg-white text-primary hover:bg-neutral-light transition-colors rounded-lg px-6 py-3 flex items-center">
                  <i className="fab fa-apple text-2xl mr-3"></i>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </a>
                
                <a href="#" className="bg-white text-primary hover:bg-neutral-light transition-colors rounded-lg px-6 py-3 flex items-center">
                  <i className="fab fa-google-play text-2xl mr-3"></i>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative max-w-xs mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1528795259021-d8c86e14354c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700&q=80" 
                  alt="MosqueTime Mobile App"
                  className="rounded-3xl shadow-2xl border-4 border-white/20 mx-auto"
                />
                <div className="absolute -top-4 -right-4 bg-secondary text-white rounded-full w-20 h-20 flex items-center justify-center text-center text-sm font-bold p-2 shadow-lg transform rotate-12">
                  Find Prayer Times Easily!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
