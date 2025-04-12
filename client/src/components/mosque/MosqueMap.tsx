import { useEffect, useRef, useState } from "react";
import { Mosque } from "@/lib/maps";

interface MosqueMapProps {
  mosques: Mosque[];
  userLocation?: { lat: number; lng: number };
  height?: string;
}

const MosqueMap: React.FC<MosqueMapProps> = ({ 
  mosques, 
  userLocation,
  height = "h-64 md:h-80" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  useEffect(() => {
    if (!mapRef.current || mosques.length === 0 || mapInitialized) return;
    
    // Import Leaflet dynamically to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix the icon paths issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      
      // Initialize map
      const map = L.map(mapRef.current).setView([40.7589, -73.9851], 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add user location marker if available
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #4285F4; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Your Location');
          
        // Create a bounds object that includes the user location
        const bounds = L.latLngBounds([userLocation.lat, userLocation.lng]);
        
        // Add mosque markers and extend bounds
        mosques.forEach(mosque => {
          const lat = parseFloat(mosque.latitude);
          const lng = parseFloat(mosque.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend([lat, lng]);
            
            L.marker([lat, lng])
              .addTo(map)
              .bindPopup(`
                <strong>${mosque.name}</strong><br>
                ${mosque.address}, ${mosque.city}<br>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="color: #10846E;">Get Directions</a>
              `);
          }
        });
        
        // Fit the map to show all markers
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (mosques.length > 0) {
        // If no user location, center on first mosque
        const lat = parseFloat(mosques[0].latitude);
        const lng = parseFloat(mosques[0].longitude);
        map.setView([lat, lng], 13);
        
        // Create bounds and add all mosques
        const bounds = L.latLngBounds();
        
        mosques.forEach(mosque => {
          const lat = parseFloat(mosque.latitude);
          const lng = parseFloat(mosque.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend([lat, lng]);
            
            L.marker([lat, lng])
              .addTo(map)
              .bindPopup(`
                <strong>${mosque.name}</strong><br>
                ${mosque.address}, ${mosque.city}<br>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="color: #10846E;">Get Directions</a>
              `);
          }
        });
        
        // Fit the map to show all markers if there are multiple
        if (mosques.length > 1) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
      
      // Update map when window resizes
      const handleResize = () => {
        map.invalidateSize();
      };
      
      window.addEventListener('resize', handleResize);
      setMapInitialized(true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        map.remove();
      };
    });
  }, [mosques, userLocation, mapInitialized]);
  
  return (
    <div className={`bg-neutral-light border border-gray-200 rounded-lg ${height} mb-6 overflow-hidden`} ref={mapRef}>
      {!mosques.length && (
        <div className="text-center p-4 h-full flex flex-col items-center justify-center">
          <i className="fas fa-map-marked-alt text-primary text-4xl mb-3"></i>
          <p className="text-neutral-dark/70">Loading map of nearby mosques...</p>
        </div>
      )}
    </div>
  );
};

export default MosqueMap;
