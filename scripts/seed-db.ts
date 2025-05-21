import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...");

  try {
    // Check if we already have users in the database
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0 && process.env.FORCE_SEED !== "true") {
      console.log("Database already has data, skipping seed");
      return;
    }

    console.log("Seeding database with initial data...");

    // Create admin user
    await db.insert(users).values({
      username: "admin",
      password: "password123", // In a real app, this would be hashed
      email: "admin@mosquetime.com",
      fullName: "Admin User",
      role: "admin",
      createdAt: new Date()
    });
    
    const [adminUser] = await db.select().from(users).where(eq(users.username, "admin"));
    console.log("Created admin user:", adminUser.id);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .catch((err) => {
    console.error("Fatal error seeding database:", err);
    process.exit(1);
  });