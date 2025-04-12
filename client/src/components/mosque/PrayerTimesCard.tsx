import { Card, CardContent } from "@/components/ui/card";
import { PrayerTimesData, PrayerTime, formatPrayerTimesForDisplay } from "@/lib/prayerTimes";

interface PrayerTimesCardProps {
  prayerTimes: PrayerTimesData;
  location: string;
  date: string;
}

const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({ prayerTimes, location, date }) => {
  const formattedTimes = formatPrayerTimesForDisplay(prayerTimes);

  return (
    <div className="relative mt-8 max-w-sm mx-auto md:max-w-md">
      <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-tr-lg rounded-bl-lg text-sm font-medium z-10">
        {location}
      </div>
      <Card className="border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white">
        <div className="bg-primary/10 p-4 border-b border-gray-200">
          <h3 className="font-heading font-bold text-xl text-primary">Today's Prayer Times</h3>
          <p className="text-sm text-neutral-dark/70">{location} · {date}</p>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {formattedTimes.map((time: PrayerTime, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-neutral-light rounded">
                <span className="font-medium">{time.name}</span>
                <span className="text-primary font-bold">{time.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrayerTimesCard;
