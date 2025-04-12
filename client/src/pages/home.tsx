import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PrayerTimesCard from "@/components/mosque/PrayerTimesCard";
import { getCurrentPosition, getLocationName } from "@/lib/maps";
import { getCurrentPrayerTimes, PrayerTimesData } from "@/lib/prayerTimes";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Calendar, Users, Compass, ArrowRight, BookOpen } from "lucide-react";

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

  // Testimonials data
  const testimonials = [
    {
      text: "MosqueTime has made it so easy to find prayer times and locate mosques when I'm traveling. It's an essential app for every Muslim.",
      author: "Ahmed S.",
      location: "New York, USA"
    },
    {
      text: "As a mosque administrator, I can easily update our prayer times and upcoming events. This has been incredibly helpful in keeping our community informed.",
      author: "Fatima K.",
      location: "Chicago, USA"
    },
    {
      text: "The Qibla direction feature is incredibly accurate. This app has made my daily prayers so much more convenient, especially when traveling.",
      author: "Mohammed A.",
      location: "Toronto, Canada"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-white py-16 md:py-24 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <i className="fas fa-mosque text-primary text-3xl"></i>
            </div>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-neutral-dark">
            Find Nearby Mosques <span className="text-primary">&</span> Prayer Times
          </h1>
          <p className="text-lg md:text-xl mb-10 text-neutral-dark/80 max-w-2xl mx-auto">
            Connect with mosques in your area, get accurate prayer times, and stay updated with community events - all in one app.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
            <Link href="/find-mosques">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium py-4 px-8 rounded-lg transition-colors shadow-md w-full md:w-auto text-base">
                <MapPin className="w-5 h-5 mr-2" />Find Nearby Mosques
              </Button>
            </Link>
            <Link href="/register-mosque">
              <Button variant="outline" className="bg-white border-primary text-primary hover:bg-primary/5 font-medium py-4 px-8 rounded-lg transition-colors shadow-sm w-full md:w-auto text-base">
                <Users className="w-5 h-5 mr-2" />Register Your Mosque
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-medium text-sm mb-4">Our Features</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">How MosqueTime Helps</h2>
            <p className="text-lg max-w-2xl mx-auto text-neutral-dark/80">Connecting worshippers to mosques and accurate prayer times with innovative technology.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-light rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-primary w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Find Nearby Mosques</h3>
              <p className="text-neutral-dark/80">Easily locate mosques near you with accurate directions and detailed information.</p>
            </div>
            
            <div className="bg-neutral-light rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-primary w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Accurate Prayer Times</h3>
              <p className="text-neutral-dark/80">Get precise prayer timings directly from local mosques with notifications.</p>
            </div>
            
            <div className="bg-neutral-light rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-primary w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">Community Events</h3>
              <p className="text-neutral-dark/80">Stay updated with mosque events like Jummah, Eid prayers, and educational programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-neutral-light/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-medium text-sm mb-4">Simple Process</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg max-w-2xl mx-auto text-neutral-dark/80">Finding mosques and prayer times has never been easier.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 text-center relative shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <div className="mt-6 mb-4">
                <MapPin className="text-primary w-10 h-10 mx-auto" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-3">Enable Location</h3>
              <p className="text-neutral-dark/80">Allow location access or enter your address to find nearby mosques.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center relative shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <div className="mt-6 mb-4">
                <Users className="text-primary w-10 h-10 mx-auto" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-3">Explore Mosques</h3>
              <p className="text-neutral-dark/80">Browse mosque details, prayer times, and upcoming events.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center relative shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <div className="mt-6 mb-4">
                <Compass className="text-primary w-10 h-10 mx-auto" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-3">Get Directions</h3>
              <p className="text-neutral-dark/80">Navigate to your chosen mosque with easy-to-follow directions.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/find-mosques">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-medium text-sm mb-4">Testimonials</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">What People Say</h2>
            <p className="text-lg max-w-2xl mx-auto text-neutral-dark/80">Hear from our community about how MosqueTime has helped them.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-neutral-light/30 rounded-xl p-8 shadow border border-neutral-light">
                <div className="mb-6">
                  <i className="fas fa-quote-left text-primary/30 text-4xl"></i>
                </div>
                <p className="text-neutral-dark/90 mb-6 italic">{testimonial.text}</p>
                <div className="flex items-center">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-bold">{testimonial.author[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-dark">{testimonial.author}</h4>
                    <p className="text-sm text-neutral-dark/70">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Promo Section */}
      <section className="py-16 bg-primary text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <span className="inline-block bg-white/20 text-white px-4 py-2 rounded-full font-medium text-sm mb-4">Mobile App</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Download the MosqueTime App</h2>
              <p className="text-lg mb-8 text-white/90">Take MosqueTime with you wherever you go. Access prayer times, find mosques, and set reminders for daily prayers directly from your smartphone.</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <a href="#" className="bg-white text-primary hover:bg-neutral-light transition-colors rounded-xl px-6 py-4 flex items-center group">
                  <i className="fab fa-apple text-3xl mr-4 group-hover:scale-110 transition-transform"></i>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="font-bold text-lg">App Store</div>
                  </div>
                </a>
                
                <a href="#" className="bg-white text-primary hover:bg-neutral-light transition-colors rounded-xl px-6 py-4 flex items-center group">
                  <i className="fab fa-google-play text-3xl mr-4 group-hover:scale-110 transition-transform"></i>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="font-bold text-lg">Google Play</div>
                  </div>
                </a>
              </div>
              
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-primary font-bold">A</div>
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-primary font-bold">M</div>
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-primary font-bold">S</div>
                </div>
                <div className="ml-4">
                  <div className="text-sm">Trusted by</div>
                  <div className="font-bold">10,000+ Muslims</div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent rounded-3xl transform rotate-3"></div>
                <img 
                  src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700&q=80" 
                  alt="MosqueTime Mobile App"
                  className="rounded-3xl shadow-2xl border-4 border-white/20 mx-auto relative z-10"
                />
                <div className="absolute -top-4 -right-4 bg-white text-primary rounded-full w-24 h-24 flex items-center justify-center text-center text-sm font-bold p-2 shadow-lg transform rotate-12 z-20">
                  Find Prayer Times Anywhere!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 bg-neutral-light/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-primary w-7 h-7" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 text-neutral-dark">Ready to Connect with Your Local Muslim Community?</h2>
            <p className="text-lg mb-8 text-neutral-dark/80">Join thousands of Muslims using MosqueTime to find nearby mosques, accurate prayer times, and community events.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/find-mosques">
                <Button className="bg-primary hover:bg-primary/90 text-white font-medium py-4 px-8 rounded-lg transition-colors shadow-md w-full sm:w-auto">
                  Find Nearby Mosques
                </Button>
              </Link>
              <Link href="/register-mosque">
                <Button variant="outline" className="bg-white border-primary text-primary hover:bg-primary/5 font-medium py-4 px-8 rounded-lg transition-colors shadow-md w-full sm:w-auto">
                  Register Your Mosque
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
