/**
 * Custom error for validation failures.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Custom error for database operation failures.
 */
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}


import {
  users, mosques, prayerTimes, events,
  insertMosqueSchema, insertPrayerTimesSchema, insertEventSchema,
  type User, type Mosque, type PrayerTime, type Event,
  type InsertUser, type InsertMosque, type InsertPrayerTime, type InsertEvent
} from "../shared/schema";

// For correct DB insert types
type MosqueInsert = typeof mosques.$inferInsert;
type PrayerTimeInsert = typeof prayerTimes.$inferInsert;
type EventInsert = typeof events.$inferInsert;
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User | undefined>;
  getPendingMosqueAdmins(): Promise<User[]>;

  // Mosque methods
  getMosque(id: number): Promise<Mosque | undefined>;
  getMosques(): Promise<Mosque[]>;
  getPendingMosques(): Promise<Mosque[]>;
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

  // Admin stats methods
  countPendingMosques(): Promise<number>;
  countTotalMosques(): Promise<number>;
  countTotalUsers(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
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
    try {
      const data = {
        ...insertUser,
        role: insertUser.role || "committee",
        createdAt: new Date()
      };
      await db.insert(users).values(data);
      const [user] = await db.select().from(users).orderBy(sql`${users.id} DESC`).limit(1);
      return user;
    } catch (err) {
      console.error("createUser error:", err);
      throw new DatabaseError("Failed to create user");
    }
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    try {
      // Prevent updating immutable fields
      const { id: _id, createdAt, ...safeUpdate } = update;
      await db.update(users).set(safeUpdate).where(eq(users.id, id));
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (err) {
      console.error("updateUser error:", err);
      throw new DatabaseError("Failed to update user");
    }
  }

  async getPendingMosqueAdmins(): Promise<User[]> {
    // Combine conditions using logical AND
    return await db.select().from(users).where(sql`${users.role} = 'committee' AND ${users.isVerified} = false`);
  }

  // Mosque methods
  async getMosque(id: number): Promise<Mosque | undefined> {
    const result = await db.select().from(mosques).where(eq(mosques.id, id));
    return result[0];
  }

  async getMosques(): Promise<Mosque[]> {
    return await db.select().from(mosques);
  }

  async getPendingMosques(): Promise<Mosque[]> {
    return await db.select().from(mosques).where(eq(mosques.verificationStatus, 'pending'));
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
    // Always enforce pending status and unverified on creation
    const enforcedMosque = {
      ...insertMosque,
      verificationStatus: 'pending',
      isVerified: false
    };
    const validMosque = insertMosqueSchema.safeParse(enforcedMosque);
    if (!validMosque.success) {
      console.error("createMosque validation error:", validMosque.error.format());
      throw new ValidationError('Invalid mosque data: ' + JSON.stringify(validMosque.error.format()));
    }
    try {
      await db.insert(mosques).values(validMosque.data as MosqueInsert);
      const [mosque] = await db.select().from(mosques).orderBy(sql`${mosques.id} DESC`).limit(1);
      return mosque;
    } catch (err) {
      console.error("createMosque error:", err);
      throw new DatabaseError("Failed to create mosque");
    }
  }

  async updateMosque(id: number, mosque: Partial<Mosque>): Promise<Mosque | undefined> {
    try {
      const { id: _id, createdAt, ...safeUpdate } = mosque;
      await db.update(mosques).set(safeUpdate).where(eq(mosques.id, id));
      const [updatedMosque] = await db.select().from(mosques).where(eq(mosques.id, id));
      return updatedMosque;
    } catch (err) {
      console.error("updateMosque error:", err);
      throw new DatabaseError("Failed to update mosque");
    }
  }

  async verifyMosque(id: number): Promise<Mosque | undefined> {
    await db.update(mosques).set({ isVerified: true, verificationStatus: 'approved' }).where(eq(mosques.id, id));
    const [verifiedMosque] = await db.select().from(mosques).where(eq(mosques.id, id));
    return verifiedMosque;
  }

  // Prayer Times methods
  async getPrayerTimes(mosqueId: number): Promise<PrayerTime | undefined> {
    const result = await db.select().from(prayerTimes).where(eq(prayerTimes.mosqueId, mosqueId));
    return result[0];
  }

  async createPrayerTimes(insertPrayerTime: InsertPrayerTime): Promise<PrayerTime> {
    const validPrayerTime = insertPrayerTimesSchema.safeParse(insertPrayerTime);
    if (!validPrayerTime.success) {
      console.error("createPrayerTimes validation error:", validPrayerTime.error.format());
      throw new ValidationError('Invalid prayer time data: ' + JSON.stringify(validPrayerTime.error.format()));
    }
    try {
      await db.insert(prayerTimes).values(validPrayerTime.data as PrayerTimeInsert);
      const mosqueId = (validPrayerTime.data as PrayerTimeInsert).mosqueId;
      const [prayerTime] = await db.select().from(prayerTimes).where(eq(prayerTimes.mosqueId, mosqueId)).orderBy(sql`${prayerTimes.id} DESC`).limit(1);
      return prayerTime;
    } catch (err) {
      console.error("createPrayerTimes error:", err);
      throw new DatabaseError("Failed to create prayer times");
    }
  }

  async updatePrayerTimes(id: number, prayerTime: Partial<PrayerTime>): Promise<PrayerTime | undefined> {
    try {
      const { id: _id, mosqueId: _mosqueId, ...safeUpdate } = prayerTime;
      await db.update(prayerTimes).set({ ...safeUpdate, updatedAt: new Date() }).where(eq(prayerTimes.id, id));
      const [updatedPrayerTime] = await db.select().from(prayerTimes).where(eq(prayerTimes.id, id));
      return updatedPrayerTime;
    } catch (err) {
      console.error("updatePrayerTimes error:", err);
      throw new DatabaseError("Failed to update prayer times");
    }
  }

  // Event methods
  async getEvents(mosqueId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.mosqueId, mosqueId));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const validEvent = insertEventSchema.safeParse(insertEvent);
    if (!validEvent.success) {
      console.error("createEvent validation error:", validEvent.error.format());
      throw new ValidationError('Invalid event data: ' + JSON.stringify(validEvent.error.format()));
    }
    try {
      await db.insert(events).values(validEvent.data as EventInsert);
      const [event] = await db.select().from(events).orderBy(sql`${events.id} DESC`).limit(1);
      return event;
    } catch (err) {
      console.error("createEvent error:", err);
      throw new DatabaseError("Failed to create event");
    }
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    try {
      const { id: _id, mosqueId: _mosqueId, ...safeUpdate } = event;
      await db.update(events).set(safeUpdate).where(eq(events.id, id));
      const [updatedEvent] = await db.select().from(events).where(eq(events.id, id));
      return updatedEvent;
    } catch (err) {
      console.error("updateEvent error:", err);
      throw new DatabaseError("Failed to update event");
    }
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      await db.delete(events).where(eq(events.id, id));
      // Check if event still exists
      const [event] = await db.select().from(events).where(eq(events.id, id));
      return !event;
    } catch (err) {
      console.error("deleteEvent error:", err);
      throw new DatabaseError("Failed to delete event");
    }
  }

  // Admin stats methods
  async countPendingMosques(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(mosques).where(eq(mosques.isVerified, false));
    return result[0].count;
  }

  async countTotalMosques(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(mosques);
    return result[0].count;
  }

  async countTotalUsers(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }
}

// Export an instance
export const storage = new DatabaseStorage();
