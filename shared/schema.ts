import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - for mosque committee members
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("committee"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

// Mosque schema
export const mosques = pgTable("mosques", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  contactNumber: text("contact_number"),
  email: text("email").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  imageUrl: text("image_url").notNull(),
  additionalImages: text("additional_images").array(),
  isVerified: boolean("is_verified").default(false),
  createdBy: integer("created_by").references(() => users.id),
  hasWomensSection: boolean("has_womens_section").default(false),
  hasAccessibleEntrance: boolean("has_accessible_entrance").default(false),
  hasParking: boolean("has_parking").default(false),
  hasWuduFacilities: boolean("has_wudu_facilities").default(false),
  hasQuranClasses: boolean("has_quran_classes").default(false),
  hasCommunityHall: boolean("has_community_hall").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMosqueSchema = createInsertSchema(mosques).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

// Prayer Times schema
export const prayerTimes = pgTable("prayer_times", {
  id: serial("id").primaryKey(),
  mosqueId: integer("mosque_id").references(() => mosques.id).notNull(),
  // Jamaat times (prayer congregation)
  fajr: text("fajr").notNull(),
  dhuhr: text("dhuhr").notNull(),
  asr: text("asr").notNull(),
  maghrib: text("maghrib").notNull(),
  isha: text("isha").notNull(),
  jummuah: text("jummuah"),
  // Azaan/Adhan times (call to prayer)
  fajrAzaan: text("fajr_azaan").notNull(),
  dhuhrAzaan: text("dhuhr_azaan").notNull(),
  asrAzaan: text("asr_azaan").notNull(),
  maghribAzaan: text("maghrib_azaan").notNull(),
  ishaAzaan: text("isha_azaan").notNull(),
  // Days when prayers are held
  fajrDays: text("fajr_days").default("Daily"),
  dhuhrDays: text("dhuhr_days").default("Daily"),
  asrDays: text("asr_days").default("Daily"),
  maghribDays: text("maghrib_days").default("Daily"),
  ishaDays: text("isha_days").default("Daily"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPrayerTimesSchema = createInsertSchema(prayerTimes).omit({
  id: true,
  updatedAt: true,
});

// Events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  mosqueId: integer("mosque_id").references(() => mosques.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  mosques: many(mosques),
}));

export const mosquesRelations = relations(mosques, ({ one, many }) => ({
  creator: one(users, {
    fields: [mosques.createdBy],
    references: [users.id],
  }),
  prayerTimes: many(prayerTimes),
  events: many(events),
}));

export const prayerTimesRelations = relations(prayerTimes, ({ one }) => ({
  mosque: one(mosques, {
    fields: [prayerTimes.mosqueId],
    references: [mosques.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  mosque: one(mosques, {
    fields: [events.mosqueId],
    references: [mosques.id],
  }),
}));

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Mosque = typeof mosques.$inferSelect;
export type InsertMosque = z.infer<typeof insertMosqueSchema>;

export type PrayerTime = typeof prayerTimes.$inferSelect;
export type InsertPrayerTime = z.infer<typeof insertPrayerTimesSchema>;

// Community schema
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'REGIONAL' or 'SCHOLARLY'
  region: text("region"), // For regional communities
  state: text("state"), // For regional communities
  district: text("district"), // For regional communities
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
});

// Community membership schema
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull().default("member"), // 'admin', 'moderator', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Community messages schema
export const communityMessages = pgTable("community_messages", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityRelations = relations(communities, ({ one, many }) => ({
  creator: one(users, {
    fields: [communities.creatorId],
    references: [users.id],
  }),
  members: many(communityMembers),
  messages: many(communityMessages),
}));

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
