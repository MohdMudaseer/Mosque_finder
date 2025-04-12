import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMosqueSchema, insertPrayerTimesSchema, insertEventSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json({ id: newUser.id, username: newUser.username, email: newUser.email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Mosque routes
  app.get("/api/mosques", async (req: Request, res: Response) => {
    try {
      const { lat, lng, radius, city } = req.query;
      
      if (lat && lng && radius) {
        const nearbyMosques = await storage.getNearbyMosques(
          parseFloat(lat as string),
          parseFloat(lng as string),
          parseFloat(radius as string)
        );
        return res.json(nearbyMosques);
      }
      
      if (city) {
        const mosquesByCity = await storage.getMosquesByCity(city as string);
        return res.json(mosquesByCity);
      }
      
      const allMosques = await storage.getMosques();
      res.json(allMosques);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mosques" });
    }
  });

  app.get("/api/mosques/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const mosque = await storage.getMosque(id);
      
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      res.json(mosque);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mosque" });
    }
  });

  app.post("/api/mosques", async (req: Request, res: Response) => {
    try {
      const mosqueData = insertMosqueSchema.parse(req.body);
      const newMosque = await storage.createMosque(mosqueData);
      res.status(201).json(newMosque);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mosque data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create mosque" });
    }
  });

  app.patch("/api/mosques/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const mosque = await storage.getMosque(id);
      
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      const updatedMosque = await storage.updateMosque(id, req.body);
      res.json(updatedMosque);
    } catch (error) {
      res.status(500).json({ message: "Failed to update mosque" });
    }
  });

  app.patch("/api/mosques/:id/verify", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const mosque = await storage.getMosque(id);
      
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      const verifiedMosque = await storage.verifyMosque(id);
      res.json(verifiedMosque);
    } catch (error) {
      res.status(500).json({ message: "Failed to verify mosque" });
    }
  });

  // Prayer Times routes
  app.get("/api/mosques/:id/prayer-times", async (req: Request, res: Response) => {
    try {
      const mosqueId = parseInt(req.params.id);
      const mosque = await storage.getMosque(mosqueId);
      
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      const prayerTimes = await storage.getPrayerTimes(mosqueId);
      
      if (!prayerTimes) {
        return res.status(404).json({ message: "Prayer times not found for this mosque" });
      }
      
      res.json(prayerTimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prayer times" });
    }
  });

  app.post("/api/mosques/:id/prayer-times", async (req: Request, res: Response) => {
    try {
      const mosqueId = parseInt(req.params.id);
      const mosque = await storage.getMosque(mosqueId);
      
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      // Check if prayer times already exist
      const existingPrayerTimes = await storage.getPrayerTimes(mosqueId);
      if (existingPrayerTimes) {
        return res.status(400).json({ message: "Prayer times already exist for this mosque" });
      }
      
      const prayerTimeData = insertPrayerTimesSchema.parse({ ...req.body, mosqueId });
      const newPrayerTimes = await storage.createPrayerTimes(prayerTimeData);
      res.status(201).json(newPrayerTimes);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid prayer time data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create prayer times" });
    }
  });

  app.patch("/api/prayer-times/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedPrayerTimes = await storage.updatePrayerTimes(id, req.body);
      
      if (!updatedPrayerTimes) {
        return res.status(404).json({ message: "Prayer times not found" });
      }
      
      res.json(updatedPrayerTimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to update prayer times" });
    }
  });

  // Event routes
  app.get("/api/mosques/:id/events", async (req: Request, res: Response) => {
    try {
      const mosqueId = parseInt(req.params.id);
      const mosque = await storage.getMosque(mosqueId);
      
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      const events = await storage.getEvents(mosqueId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/mosques/:id/events", async (req: Request, res: Response) => {
    try {
      const mosqueId = parseInt(req.params.id);
      const mosque = await storage.getMosque(mosqueId);
      
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      const eventData = insertEventSchema.parse({ ...req.body, mosqueId });
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const updatedEvent = await storage.updateEvent(id, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      await storage.deleteEvent(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Get the default prayer times for the current location
  app.get("/api/prayer-times", async (req: Request, res: Response) => {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      // In a real app, you would use a prayer times calculation library here
      // For this example, we'll return the default prayer times
      const now = new Date();
      const prayerTimes = {
        date: now.toISOString().split('T')[0],
        location: "Current Location",
        fajr: "04:15 AM",
        dhuhr: "12:20 PM",
        asr: "04:45 PM",
        maghrib: "07:38 PM",
        isha: "09:10 PM",
        jummuah: "01:30 PM"
      };
      
      res.json(prayerTimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prayer times" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
