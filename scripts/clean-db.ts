import { db } from "../server/db";
import { users, mosques, prayerTimes, events } from "../shared/schema";
import { sql } from "drizzle-orm";

async function cleanDatabase() {
  console.log("Cleaning database...");

  try {
    // Delete all data in reverse order of dependencies
    await db.delete(events);
    await db.delete(prayerTimes);
    await db.delete(mosques);
    await db.delete(users);

    console.log("Database cleaned successfully!");
  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  }
}

cleanDatabase()
  .catch((err) => {
    console.error("Fatal error cleaning database:", err);
    process.exit(1);
  });
