import { users, mosques, prayerTimes, events } from "@shared/schema";
import type { User, InsertUser, Mosque, InsertMosque, PrayerTime, InsertPrayerTime, Event, InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mosque methods
  getMosque(id: number): Promise<Mosque | undefined>;
  getMosques(): Promise<Mosque[]>;
  getMosquesByCity(city: string): Promise<Mosque[]>;
  getNearbyMosques(lat: number, lng: number, radius: number): Promise<Mosque[]>;
  createMosque(mosque: InsertMosque): Promise<Mosque>;
  updateMosque(id: number, mosque: Partial<Mosque>): Promise<Mosque | undefined>;
  verifyMosque(id: number): Promise<Mosque | undefined>;
  
  // Prayer Times methods
  getPrayerTimes(mosqueId: number): Promise<PrayerTime | undefined>;
  createPrayerTimes(prayerTime: InsertPrayerTime): Promise<PrayerTime>;
  updatePrayerTimes(id: number, prayerTime: Partial<PrayerTime>): Promise<PrayerTime | undefined>;
  
  // Event methods
  getEvents(mosqueId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private mosques: Map<number, Mosque>;
  private prayerTimes: Map<number, PrayerTime>;
  private events: Map<number, Event>;
  private userCurrentId: number;
  private mosqueCurrentId: number;
  private prayerTimeCurrentId: number;
  private eventCurrentId: number;

  constructor() {
    this.users = new Map();
    this.mosques = new Map();
    this.prayerTimes = new Map();
    this.events = new Map();
    this.userCurrentId = 1;
    this.mosqueCurrentId = 1;
    this.prayerTimeCurrentId = 1;
    this.eventCurrentId = 1;
    
    // Add some initial data
    this.addSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Mosque methods
  async getMosque(id: number): Promise<Mosque | undefined> {
    return this.mosques.get(id);
  }

  async getMosques(): Promise<Mosque[]> {
    return Array.from(this.mosques.values());
  }

  async getMosquesByCity(city: string): Promise<Mosque[]> {
    return Array.from(this.mosques.values()).filter(
      (mosque) => mosque.city.toLowerCase() === city.toLowerCase(),
    );
  }

  // Simple implementation for getting nearby mosques (would be more sophisticated in a real app)
  async getNearbyMosques(lat: number, lng: number, radius: number): Promise<Mosque[]> {
    // This is a very basic implementation of finding mosques within a radius
    // Would be more sophisticated with actual geospatial calculations
    const mosques = Array.from(this.mosques.values());
    const result = mosques.map(mosque => {
      const distance = this.calculateDistance(
        lat,
        lng,
        parseFloat(mosque.latitude),
        parseFloat(mosque.longitude)
      );
      return { mosque, distance };
    })
    .filter(item => item.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .map(item => {
      return {
        ...item.mosque,
        distance: item.distance
      };
    });

    return result;
  }

  async createMosque(insertMosque: InsertMosque): Promise<Mosque> {
    const id = this.mosqueCurrentId++;
    const now = new Date();
    const mosque: Mosque = { ...insertMosque, id, isVerified: false, createdAt: now };
    this.mosques.set(id, mosque);
    return mosque;
  }

  async updateMosque(id: number, mosque: Partial<Mosque>): Promise<Mosque | undefined> {
    const existingMosque = this.mosques.get(id);
    if (!existingMosque) return undefined;

    const updatedMosque = { ...existingMosque, ...mosque };
    this.mosques.set(id, updatedMosque);
    return updatedMosque;
  }

  async verifyMosque(id: number): Promise<Mosque | undefined> {
    const mosque = this.mosques.get(id);
    if (!mosque) return undefined;

    mosque.isVerified = true;
    this.mosques.set(id, mosque);
    return mosque;
  }

  // Prayer Times methods
  async getPrayerTimes(mosqueId: number): Promise<PrayerTime | undefined> {
    return Array.from(this.prayerTimes.values()).find(
      (pt) => pt.mosqueId === mosqueId,
    );
  }

  async createPrayerTimes(insertPrayerTime: InsertPrayerTime): Promise<PrayerTime> {
    const id = this.prayerTimeCurrentId++;
    const now = new Date();
    const prayerTime: PrayerTime = { ...insertPrayerTime, id, updatedAt: now };
    this.prayerTimes.set(id, prayerTime);
    return prayerTime;
  }

  async updatePrayerTimes(id: number, prayerTime: Partial<PrayerTime>): Promise<PrayerTime | undefined> {
    const existingPrayerTime = this.prayerTimes.get(id);
    if (!existingPrayerTime) return undefined;

    const now = new Date();
    const updatedPrayerTime = { ...existingPrayerTime, ...prayerTime, updatedAt: now };
    this.prayerTimes.set(id, updatedPrayerTime);
    return updatedPrayerTime;
  }

  // Event methods
  async getEvents(mosqueId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.mosqueId === mosqueId,
    );
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const now = new Date();
    const event: Event = { ...insertEvent, id, createdAt: now };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) return undefined;

    const updatedEvent = { ...existingEvent, ...event };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Helper functions
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Simple implementation of Haversine formula to calculate distance in km
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private addSampleData(): void {
    // Sample mosques
    const mosque1 = this.createMosque({
      name: "Manhattan Islamic Center",
      address: "154 East 55th Street",
      city: "New York",
      contactNumber: "+1-212-555-1234",
      email: "info@manhattanislamiccenter.org",
      latitude: "40.7589",
      longitude: "-73.9851",
      imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      additionalImages: [],
      hasWomensSection: true,
      hasAccessibleEntrance: true,
      hasParking: false,
      hasWuduFacilities: true,
      hasQuranClasses: true,
      hasCommunityHall: false,
      createdBy: 1
    });

    const mosque2 = this.createMosque({
      name: "Islamic Cultural Center of New York",
      address: "1711 3rd Ave",
      city: "New York",
      contactNumber: "+1-212-555-5678",
      email: "info@iccny.org",
      latitude: "40.7831",
      longitude: "-73.9547",
      imageUrl: "https://images.unsplash.com/photo-1601991115814-b9306d1e3c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      additionalImages: [],
      hasWomensSection: true,
      hasAccessibleEntrance: true,
      hasParking: true,
      hasWuduFacilities: true,
      hasQuranClasses: true,
      hasCommunityHall: true,
      createdBy: 1
    });

    const mosque3 = this.createMosque({
      name: "Masjid Al-Hikmah",
      address: "55 East 76th Street",
      city: "New York",
      contactNumber: "+1-212-555-9012",
      email: "info@alhikmah.org",
      latitude: "40.7733",
      longitude: "-73.9625",
      imageUrl: "https://images.unsplash.com/photo-1566903451935-7e76633cd182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
      additionalImages: [],
      hasWomensSection: false,
      hasAccessibleEntrance: false,
      hasParking: false,
      hasWuduFacilities: true,
      hasQuranClasses: false,
      hasCommunityHall: false,
      createdBy: 1
    });

    // Add prayer times for each mosque
    this.createPrayerTimes({
      mosqueId: 1,
      fajr: "04:30",
      dhuhr: "12:30",
      asr: "04:50",
      maghrib: "07:40",
      isha: "09:15",
      jummuah: "13:15",
      fajrDays: "Daily",
      dhuhrDays: "Daily",
      asrDays: "Daily",
      maghribDays: "Daily",
      ishaDays: "Daily"
    });

    this.createPrayerTimes({
      mosqueId: 2,
      fajr: "04:15",
      dhuhr: "12:20",
      asr: "04:45",
      maghrib: "07:38",
      isha: "09:10",
      jummuah: "13:30",
      fajrDays: "Daily",
      dhuhrDays: "Daily",
      asrDays: "Daily",
      maghribDays: "Daily",
      ishaDays: "Daily"
    });

    this.createPrayerTimes({
      mosqueId: 3,
      fajr: "04:20",
      dhuhr: "12:15",
      asr: "04:40",
      maghrib: "07:35",
      isha: "09:05",
      jummuah: "13:45",
      fajrDays: "Daily",
      dhuhrDays: "Daily",
      asrDays: "Daily",
      maghribDays: "Daily",
      ishaDays: "Daily"
    });

    // Add events
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    this.createEvent({
      mosqueId: 2,
      name: "Shab-e-Qadr",
      description: "Special prayers for the Night of Power during Ramadan",
      date: futureDate,
      time: "21:00",
      isRecurring: false
    });
  }
}

export class DatabaseStorage implements IStorage {
  // Helper functions for distance calculation
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Simple implementation of Haversine formula to calculate distance in km
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Mosque methods
  async getMosque(id: number): Promise<Mosque | undefined> {
    const result = await db.select().from(mosques).where(eq(mosques.id, id));
    return result[0];
  }

  async getMosques(): Promise<Mosque[]> {
    return await db.select().from(mosques);
  }

  async getMosquesByCity(city: string): Promise<Mosque[]> {
    return await db.select().from(mosques).where(eq(sql`LOWER(${mosques.city})`, city.toLowerCase()));
  }

  async getNearbyMosques(lat: number, lng: number, radius: number): Promise<Mosque[]> {
    // First, get all mosques
    const allMosques = await db.select().from(mosques);
    
    // Then, calculate distances and filter
    const result = allMosques.map(mosque => {
      const distance = this.calculateDistance(
        lat,
        lng,
        parseFloat(mosque.latitude),
        parseFloat(mosque.longitude)
      );
      return { mosque, distance };
    })
    .filter(item => item.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .map(item => {
      return {
        ...item.mosque,
        distance: item.distance
      };
    });

    return result;
  }

  async createMosque(insertMosque: InsertMosque): Promise<Mosque> {
    const result = await db.insert(mosques).values(insertMosque).returning();
    return result[0];
  }

  async updateMosque(id: number, mosque: Partial<Mosque>): Promise<Mosque | undefined> {
    const result = await db.update(mosques)
      .set(mosque)
      .where(eq(mosques.id, id))
      .returning();
    return result[0];
  }

  async verifyMosque(id: number): Promise<Mosque | undefined> {
    const result = await db.update(mosques)
      .set({ isVerified: true })
      .where(eq(mosques.id, id))
      .returning();
    return result[0];
  }

  // Prayer Times methods
  async getPrayerTimes(mosqueId: number): Promise<PrayerTime | undefined> {
    const result = await db.select()
      .from(prayerTimes)
      .where(eq(prayerTimes.mosqueId, mosqueId));
    return result[0];
  }

  async createPrayerTimes(insertPrayerTime: InsertPrayerTime): Promise<PrayerTime> {
    const result = await db.insert(prayerTimes)
      .values(insertPrayerTime)
      .returning();
    return result[0];
  }

  async updatePrayerTimes(id: number, prayerTime: Partial<PrayerTime>): Promise<PrayerTime | undefined> {
    const result = await db.update(prayerTimes)
      .set({ ...prayerTime, updatedAt: new Date() })
      .where(eq(prayerTimes.id, id))
      .returning();
    return result[0];
  }

  // Event methods
  async getEvents(mosqueId: number): Promise<Event[]> {
    return await db.select()
      .from(events)
      .where(eq(events.mosqueId, mosqueId));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select()
      .from(events)
      .where(eq(events.id, id));
    return result[0];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events)
      .values(insertEvent)
      .returning();
    return result[0];
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const result = await db.update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events)
      .where(eq(events.id, id))
      .returning();
    return result.length > 0;
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();
