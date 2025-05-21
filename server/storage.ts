import {
  users, mosques, prayerTimes, events,
  type User, type Mosque, type PrayerTime, type Event,
  type InsertUser, type InsertMosque, type InsertPrayerTime, type InsertEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
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
    const data = {
      ...insertUser,
      role: insertUser.role || "committee",
      createdAt: new Date()
    };

    await db.insert(users).values(data);
    
    const [user] = await db.select().from(users)
      .orderBy(sql`${users.id} DESC`)
      .limit(1);
    
    return user;
  }

  async getMosque(id: number): Promise<Mosque | undefined> {
    const result = await db.select().from(mosques).where(eq(mosques.id, id));
    return result[0];
  }

  async getMosques(): Promise<Mosque[]> {
    return await db.select().from(mosques);
  }

  async getPendingMosques(): Promise<Mosque[]> {
    return await db.select()
      .from(mosques)
      .where(eq(mosques.verificationStatus, 'pending'));
  }

  async getMosquesByCity(city: string): Promise<Mosque[]> {
    return await db.select().from(mosques).where(eq(mosques.city, city));
  }

  async getNearbyMosques(lat: number, lng: number, radius: number): Promise<Mosque[]> {
    // For now just return all mosques
    // TODO: Implement proper geographical search with radius
    return await db.select().from(mosques);
  }

  async createMosque(insertMosque: InsertMosque): Promise<Mosque> {
    await db.insert(mosques).values({
      ...insertMosque,
      isVerified: false,
      additionalImages: null,
      createdAt: new Date()
    });
    
    // Get the most recently inserted mosque
    const [mosque] = await db.select()
      .from(mosques)
      .orderBy(sql`${mosques.id} DESC`)
      .limit(1);
    
    return mosque;
    
    return mosque;
  }

  async updateMosque(id: number, mosque: Partial<Mosque>): Promise<Mosque | undefined> {
    await db.update(mosques)
      .set(mosque)
      .where(eq(mosques.id, id));
    
    const [updatedMosque] = await db.select()
      .from(mosques)
      .where(eq(mosques.id, id));
    return updatedMosque;
  }

  async verifyMosque(id: number, verified: boolean): Promise<Mosque | undefined> {
    await db.update(mosques)
      .set({ 
        isVerified: verified,
        verificationStatus: verified ? 'approved' : 'rejected'
      })
      .where(eq(mosques.id, id));
    
    const [verifiedMosque] = await db.select()
      .from(mosques)
      .where(eq(mosques.id, id));
    return verifiedMosque;
  }

  async getPrayerTimes(mosqueId: number): Promise<PrayerTime | undefined> {
    const result = await db.select()
      .from(prayerTimes)
      .where(eq(prayerTimes.mosqueId, mosqueId));
    return result[0];
  }

  async createPrayerTimes(insertPrayerTime: InsertPrayerTime): Promise<PrayerTime> {
    await db.insert(prayerTimes).values({
      ...insertPrayerTime,
      updatedAt: new Date()
    });
    
    // Get the most recently inserted prayer times
    const [prayerTime] = await db.select()
      .from(prayerTimes)
      .where(eq(prayerTimes.mosqueId, insertPrayerTime.mosqueId))
      .orderBy(sql`${prayerTimes.id} DESC`)
      .limit(1);
    
    return prayerTime;
  }

  async updatePrayerTimes(id: number, prayerTime: Partial<PrayerTime>): Promise<PrayerTime | undefined> {
    await db.update(prayerTimes)
      .set({
        ...prayerTime,
        updatedAt: new Date()
      })
      .where(eq(prayerTimes.id, id));
    
    const [updatedPrayerTime] = await db.select()
      .from(prayerTimes)
      .where(eq(prayerTimes.id, id));
    return updatedPrayerTime;
  }

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
    await db.insert(events).values({
      ...insertEvent,
      createdAt: new Date()
    });
    
    const [event] = await db.select()
      .from(events)
      .orderBy(sql`${events.id} DESC`)
      .limit(1);
    
    return event;
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    await db.update(events)
      .set(event)
      .where(eq(events.id, id));
    
    const [updatedEvent] = await db.select()
      .from(events)
      .where(eq(events.id, id));
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }
}

// Export an instance
export const storage = new DatabaseStorage();
