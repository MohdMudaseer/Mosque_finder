import { users, mosques, prayerTimes } from "../shared/schema";
import { eq } from "drizzle-orm";
import { generateMosqueId } from "../server/utils/id-generator";
import { hashPassword } from "../server/utils/auth";
import { db } from "../server/db";

async function seedDemoData() {
  console.log("Starting demo data seed...");

  try {
    // Create admin user if it doesn't exist
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));
    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        email: "admin@mosquetime.com",
        fullName: "System Administrator",
        role: "system_admin",
        createdAt: new Date()
      });
      console.log("Created system admin user with email: admin@mosquetime.com");
    }

    // Create mosque committee users
    await db.insert(users).values({
      username: "masjid1",
      password: await hashPassword("password123"),
      email: "committee1@masjid.com",
      fullName: "Masjid Committee 1",
      role: "committee",
      createdAt: new Date()
    });
    
    const [committee1] = await db.select().from(users).where(eq(users.email, "committee1@masjid.com"));

    await db.insert(users).values({
      username: "masjid2",
      password: await hashPassword("password123"),
      email: "committee2@masjid.com",
      fullName: "Masjid Committee 2",
      role: "committee",
      createdAt: new Date()
    });
    
    const [committee2] = await db.select().from(users).where(eq(users.email, "committee2@masjid.com"));

    // Create pending mosques
    await db.insert(mosques).values({
      name: "Masjid Al-Rahma",
      address: "123 Islamic Way",
      city: "New York",
      contactNumber: "+1 (555) 123-4567",
      email: "info@alrahma.org",
      mosqueIdentifier: generateMosqueId(),
      latitude: "40.7128",
      longitude: "-74.0060",
      imageUrl: "https://example.com/mosque1.jpg",
      isVerified: false,
      verificationStatus: "pending",
      createdBy: committee1.id,
      hasWomensSection: true,
      hasAccessibleEntrance: true,
      hasParking: true,
      hasWuduFacilities: true,
      hasQuranClasses: true,
      hasCommunityHall: true,
      createdAt: new Date()
    });
    
    const [mosque1] = await db.select().from(mosques).where(eq(mosques.email, "info@alrahma.org"));

    await db.insert(mosques).values({
      name: "Masjid Al-Noor",
      address: "456 Peace Street",
      city: "New York",
      contactNumber: "+1 (555) 987-6543",
      email: "info@alnoor.org",
      mosqueIdentifier: generateMosqueId(),
      latitude: "40.7589",
      longitude: "-73.9851",
      imageUrl: "https://example.com/mosque2.jpg",
      isVerified: false,
      verificationStatus: "pending",
      createdBy: committee2.id,
      hasWomensSection: true,
      hasAccessibleEntrance: false,
      hasParking: true,
      hasWuduFacilities: true,
      hasQuranClasses: false,
      hasCommunityHall: false,
      createdAt: new Date()
    });

    const [mosque2] = await db.select().from(mosques).where(eq(mosques.email, "info@alnoor.org"));

    // Add prayer times for the mosques
    await db.insert(prayerTimes).values({
      mosqueId: mosque1.id,
      fajr: "05:30",
      dhuhr: "13:30",
      asr: "17:00",
      maghrib: "20:15",
      isha: "21:45",
      jummuah: "13:30",
      fajrAzaan: "05:15",
      dhuhrAzaan: "13:15",
      asrAzaan: "16:45",
      maghribAzaan: "20:00",
      ishaAzaan: "21:30",
      fajrDays: "Daily",
      dhuhrDays: "Daily",
      asrDays: "Daily",
      maghribDays: "Daily",
      ishaDays: "Daily"
    });

    await db.insert(prayerTimes).values({
      mosqueId: mosque2.id,
      fajr: "05:45",
      dhuhr: "13:15",
      asr: "16:45",
      maghrib: "20:00",
      isha: "21:30",
      jummuah: "13:30",
      fajrAzaan: "05:30",
      dhuhrAzaan: "13:00",
      asrAzaan: "16:30",
      maghribAzaan: "19:45",
      ishaAzaan: "21:15",
      fajrDays: "Daily",
      dhuhrDays: "Daily",
      asrDays: "Daily",
      maghribDays: "Daily",
      ishaDays: "Daily"
    });

    console.log("Demo data seeded successfully!");
  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
}

seedDemoData()
  .catch((err) => {
    console.error("Fatal error seeding demo data:", err);
    process.exit(1);
  });