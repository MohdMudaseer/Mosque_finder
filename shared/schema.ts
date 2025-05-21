import {
  mysqlTable,
  varchar,
  int,
  boolean,
  timestamp,
  bigint
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Users ────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("committee"),
  mosqueId: varchar("mosque_id", { length: 50 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

export const usersRelations = relations(users, ({ many }) => ({
  mosques: many(mosques),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ─── Mosques ───────────────────────────────────────────
export const mosques = mysqlTable("mosques", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  contactNumber: varchar("contact_number", { length: 20 }),
  email: varchar("email", { length: 255 }).notNull(),
  mosqueIdentifier: varchar("mosque_identifier", { length: 50 }).unique(),
  latitude: varchar("latitude", { length: 50 }).notNull(),
  longitude: varchar("longitude", { length: 50 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  additionalImages: varchar("additional_images", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: varchar("verification_status", { length: 20 }).default("pending"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => users.id),
  hasWomensSection: boolean("has_womens_section").default(false),
  hasAccessibleEntrance: boolean("has_accessible_entrance").default(false),
  hasParking: boolean("has_parking").default(false),
  hasWuduFacilities: boolean("has_wudu_facilities").default(false),
  hasQuranClasses: boolean("has_quran_classes").default(false),
  hasCommunityHall: boolean("has_community_hall").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMosqueSchema = createInsertSchema(mosques).omit(["id", "isVerified", "createdAt"]);

export const mosquesRelations = relations(mosques, ({ one, many }) => ({
  creator: one(users, {
    fields: [mosques.createdBy],
    references: [users.id],
  }),
  prayerTimes: many(prayerTimes),
  events: many(events),
}));

export type Mosque = typeof mosques.$inferSelect;
export type InsertMosque = z.infer<typeof insertMosqueSchema>;

// ─── Prayer Times ─────────────────────────────────────
export const prayerTimes = mysqlTable("prayer_times", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  mosqueId: bigint("mosque_id", { mode: "number", unsigned: true }).references(() => mosques.id).notNull(),
  fajr: varchar("fajr", { length: 50 }).notNull(),
  dhuhr: varchar("dhuhr", { length: 50 }).notNull(),
  asr: varchar("asr", { length: 50 }).notNull(),
  maghrib: varchar("maghrib", { length: 50 }).notNull(),
  isha: varchar("isha", { length: 50 }).notNull(),
  jummuah: varchar("jummuah", { length: 50 }),
  fajrAzaan: varchar("fajr_azaan", { length: 50 }).notNull(),
  dhuhrAzaan: varchar("dhuhr_azaan", { length: 50 }).notNull(),
  asrAzaan: varchar("asr_azaan", { length: 50 }).notNull(),
  maghribAzaan: varchar("maghrib_azaan", { length: 50 }).notNull(),
  ishaAzaan: varchar("isha_azaan", { length: 50 }).notNull(),
  fajrDays: varchar("fajr_days", { length: 50 }).default("Daily"),
  dhuhrDays: varchar("dhuhr_days", { length: 50 }).default("Daily"),
  asrDays: varchar("asr_days", { length: 50 }).default("Daily"),
  maghribDays: varchar("maghrib_days", { length: 50 }).default("Daily"),
  ishaDays: varchar("isha_days", { length: 50 }).default("Daily"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPrayerTimesSchema = createInsertSchema(prayerTimes).omit(["id", "updatedAt"]);

export const prayerTimesRelations = relations(prayerTimes, ({ one }) => ({
  mosque: one(mosques, {
    fields: [prayerTimes.mosqueId],
    references: [mosques.id],
  }),
}));

export type PrayerTime = typeof prayerTimes.$inferSelect;
export type InsertPrayerTime = z.infer<typeof insertPrayerTimesSchema>;

// ─── Events ───────────────────────────────────────────
export const events = mysqlTable("events", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  mosqueId: bigint("mosque_id", { mode: "number", unsigned: true }).references(() => mosques.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit(["id", "createdAt"]);

export const eventsRelations = relations(events, ({ one }) => ({
  mosque: one(mosques, {
    fields: [events.mosqueId],
    references: [mosques.id],
  }),
}));

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
