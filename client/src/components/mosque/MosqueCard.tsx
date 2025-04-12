import { Link } from "wouter";
import { Mosque, MosquePrayerTimes, formatDistance } from "@/lib/maps";

interface MosqueCardProps {
  mosque: Mosque;
  prayerTimes: MosquePrayerTimes;
}

const MosqueCard: React.FC<MosqueCardProps> = ({ mosque, prayerTimes }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 md:h-auto">
          <img 
            src={mosque.imageUrl} 
            alt={mosque.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:w-2/3 p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-heading font-bold text-xl mb-2">{mosque.name}</h3>
            {mosque.distance !== undefined && (
              <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                {formatDistance(mosque.distance)}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-dark/70 mb-3">
            <i className="fas fa-map-marker-alt mr-1"></i> {mosque.address}, {mosque.city}
          </p>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-neutral-light p-1 rounded text-center">
              <span className="text-xs font-medium block">Fajr</span>
              <span className="text-sm font-bold block text-primary">{prayerTimes.fajr}</span>
            </div>
            <div className="bg-neutral-light p-1 rounded text-center">
              <span className="text-xs font-medium block">Dhuhr</span>
              <span className="text-sm font-bold block text-primary">{prayerTimes.dhuhr}</span>
            </div>
            <div className="bg-neutral-light p-1 rounded text-center">
              <span className="text-xs font-medium block">Asr</span>
              <span className="text-sm font-bold block text-primary">{prayerTimes.asr}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {prayerTimes.jummuah && (
              <span className="text-xs bg-secondary/10 text-secondary rounded-full px-2 py-1">
                <i className="fas fa-calendar-alt mr-1"></i>Jumu'ah: {prayerTimes.jummuah}
              </span>
            )}
            
            {mosque.hasWomensSection && (
              <span className="text-xs bg-neutral-light rounded-full px-2 py-1">
                <i className="fas fa-female mr-1"></i>Women's Section
              </span>
            )}
            
            {mosque.hasAccessibleEntrance && (
              <span className="text-xs bg-neutral-light rounded-full px-2 py-1">
                <i className="fas fa-wheelchair mr-1"></i>Accessible
              </span>
            )}
          </div>
          
          <div className="flex gap-2 mt-auto">
            <Link href={`/mosques/${mosque.id}`}>
              <a className="text-sm text-primary font-medium hover:text-primary/80 flex items-center">
                <i className="fas fa-mosque mr-1"></i> More Details
              </a>
            </Link>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary font-medium hover:text-primary/80 flex items-center ml-4"
            >
              <i className="fas fa-directions mr-1"></i> Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MosqueCard;
