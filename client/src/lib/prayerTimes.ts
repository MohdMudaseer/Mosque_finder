// This is a simple module to get prayer times based on location
// In a real world application, we would use a more sophisticated prayer time calculation library
// like Aladhan API or PrayTimes.js

import { apiRequest } from "./queryClient";

export interface PrayerTime {
  name: string;
  time: string;
}

export interface PrayerTimesData {
  date: string;
  location: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummuah?: string;
}

export async function getCurrentPrayerTimes(latitude: number, longitude: number): Promise<PrayerTimesData> {
  try {
    const response = await apiRequest(
      "GET", 
      `/api/prayer-times?lat=${latitude}&lng=${longitude}`,
      undefined
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
}

export function formatPrayerTimesForDisplay(prayerTimes: PrayerTimesData): PrayerTime[] {
  return [
    { name: "Fajr", time: prayerTimes.fajr },
    { name: "Dhuhr", time: prayerTimes.dhuhr },
    { name: "Asr", time: prayerTimes.asr },
    { name: "Maghrib", time: prayerTimes.maghrib },
    { name: "Isha", time: prayerTimes.isha },
    ...(prayerTimes.jummuah ? [{ name: "Jumu'ah", time: prayerTimes.jummuah }] : []),
  ];
}

export function getActiveTimeIndex(prayerTimes: PrayerTimesData): number {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert prayer times to 24-hour format for comparison
  const timeStrings = [
    prayerTimes.fajr,
    prayerTimes.dhuhr,
    prayerTimes.asr,
    prayerTimes.maghrib,
    prayerTimes.isha
  ];
  
  const times = timeStrings.map(timeStr => {
    const [time, period] = timeStr.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return { hour, minute };
  });
  
  // Find the next prayer time
  for (let i = 0; i < times.length; i++) {
    const prayerTime = times[i];
    
    if (
      prayerTime.hour > currentHour || 
      (prayerTime.hour === currentHour && prayerTime.minute > currentMinute)
    ) {
      return i;
    }
  }
  
  // If all prayer times have passed, show the first prayer for the next day
  return 0;
}
