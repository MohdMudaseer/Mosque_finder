import { db } from "../server/db";
import { users, mosques, prayerTimes, events } from "../shared/schema";

async function seed() {
  console.log("Starting database seed...");

  try {
    // Check if we already have users in the database
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }

    console.log("Seeding database with initial data...");

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: "password123", // In a real app, this would be hashed
      email: "admin@mosquetime.com",
      fullName: "Admin User",
      role: "admin"
    }).returning();

    console.log("Created admin user:", adminUser.id);

    // Sample mosques
    const mosquesData = [
      {
        name: "Manhattan Islamic Center",
        address: "154 East 55th Street",
        city: "New York",
        contactNumber: "+1-212-555-1234",
        email: "info@manhattanislamiccenter.org",
        latitude: "40.7589",
        longitude: "-73.9851",
        imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
        additionalImages: [],
        isVerified: true,
        createdBy: adminUser.id,
        hasWomensSection: true,
        hasAccessibleEntrance: true,
        hasParking: false,
        hasWuduFacilities: true,
        hasQuranClasses: true,
        hasCommunityHall: false,
      },
      {
        name: "Islamic Cultural Center of New York",
        address: "1711 3rd Ave",
        city: "New York",
        contactNumber: "+1-212-555-5678",
        email: "info@iccny.org",
        latitude: "40.7831",
        longitude: "-73.9547",
        imageUrl: "https://images.unsplash.com/photo-1601991115814-b9306d1e3c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
        additionalImages: [],
        isVerified: true,
        createdBy: adminUser.id,
        hasWomensSection: true,
        hasAccessibleEntrance: true,
        hasParking: true,
        hasWuduFacilities: true,
        hasQuranClasses: true,
        hasCommunityHall: true,
      },
      {
        name: "Masjid Al-Hikmah",
        address: "55 East 76th Street",
        city: "New York",
        contactNumber: "+1-212-555-9012",
        email: "info@alhikmah.org",
        latitude: "40.7733",
        longitude: "-73.9625",
        imageUrl: "https://images.unsplash.com/photo-1566903451935-7e76633cd182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
        additionalImages: [],
        isVerified: true,
        createdBy: adminUser.id,
        hasWomensSection: false,
        hasAccessibleEntrance: false,
        hasParking: false,
        hasWuduFacilities: true,
        hasQuranClasses: false,
        hasCommunityHall: false,
      }
    ];

    const createdMosques = await Promise.all(
      mosquesData.map(async (mosque) => {
        const [created] = await db.insert(mosques).values(mosque).returning();
        console.log(`Created mosque: ${created.name} with ID ${created.id}`);
        return created;
      })
    );

    // Add prayer times for each mosque
    const prayerTimesData = [
      {
        mosqueId: createdMosques[0].id,
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
      },
      {
        mosqueId: createdMosques[1].id,
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
      },
      {
        mosqueId: createdMosques[2].id,
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
      }
    ];

    await Promise.all(
      prayerTimesData.map(async (prayerTime) => {
        const [created] = await db.insert(prayerTimes).values(prayerTime).returning();
        console.log(`Created prayer times for mosque ID ${created.mosqueId}`);
        return created;
      })
    );

    // Add sample event
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const [event] = await db.insert(events).values({
      mosqueId: createdMosques[1].id,
      name: "Shab-e-Qadr",
      description: "Special prayers for the Night of Power during Ramadan",
      date: futureDate,
      time: "21:00",
      isRecurring: false
    }).returning();

    console.log(`Created event: ${event.name} for mosque ID ${event.mosqueId}`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error during seeding:", error);
    process.exit(1);
  });