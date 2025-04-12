import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  onSearch: (filters: {
    location: string;
    radius: number;
    filters: {
      hasJummuah: boolean;
      hasWomensSection: boolean;
      hasEvents: boolean;
      isAccessible: boolean;
    }
  }) => void;
  onGetLocation: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onGetLocation }) => {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("5");
  const [hasJummuah, setHasJummuah] = useState(false);
  const [hasWomensSection, setHasWomensSection] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location,
      radius: parseInt(radius),
      filters: {
        hasJummuah,
        hasWomensSection,
        hasEvents,
        isAccessible
      }
    });
  };

  return (
    <div className="sticky top-20">
      <h2 className="font-heading text-2xl font-bold mb-4">Find Mosques Near You</h2>
      <p className="mb-6 text-neutral-dark/80">Search for mosques by location or use your current location to find prayer times.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-neutral-light p-4 rounded-lg shadow-sm mb-6">
          <div className="mb-4">
            <Label htmlFor="location" className="block text-sm font-medium mb-1">Location</Label>
            <div className="relative">
              <Input 
                type="text" 
                id="location" 
                placeholder="Enter city or address" 
                className="w-full pr-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary"
                onClick={onGetLocation}
              >
                <i className="fas fa-location-arrow"></i>
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="radius" className="block text-sm font-medium mb-1">Radius</Label>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger id="radius" className="w-full">
                <SelectValue placeholder="Select radius" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 km</SelectItem>
                <SelectItem value="3">3 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            <i className="fas fa-search mr-2"></i>Search
          </Button>
        </div>
      </form>
      
      <div className="bg-neutral-light p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-3">Filters</h3>
        
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasJummuah" 
              checked={hasJummuah}
              onCheckedChange={(checked) => setHasJummuah(checked === true)}
            />
            <Label htmlFor="hasJummuah">Has Jumu'ah Prayer</Label>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasWomensSection" 
              checked={hasWomensSection}
              onCheckedChange={(checked) => setHasWomensSection(checked === true)}
            />
            <Label htmlFor="hasWomensSection">Facilities for Women</Label>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hasEvents" 
              checked={hasEvents}
              onCheckedChange={(checked) => setHasEvents(checked === true)}
            />
            <Label htmlFor="hasEvents">Upcoming Events</Label>
          </div>
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isAccessible" 
              checked={isAccessible}
              onCheckedChange={(checked) => setIsAccessible(checked === true)}
            />
            <Label htmlFor="isAccessible">Accessible Entrance</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
