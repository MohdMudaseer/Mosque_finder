import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertMosqueSchema, insertPrayerTimesSchema, insertEventSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword, comparePasswords, validatePassword } from "./utils/auth";
import { requireAuth, requireAdmin, validateMosqueId } from "./utils/middleware";
import { generateMosqueId } from "./utils/id-generator";

// Extend express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    role: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    secret: 'your-secret-key', // In production, use a proper secret key from environment variables
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  // User routes
  app.post("/api/login", validateMosqueId, async (req: Request, res: Response) => {
    try {
      const { email, password, userType } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // For mosque admins, ensure they are associated with the mosque
      if (userType === 'admin' && req.mosque) {
        if (user.role !== 'committee' || user.id !== req.mosque.createdBy) {
          return res.status(403).json({ 
            message: "You are not authorized to access this mosque's admin panel" 
          });
        }
      }

      // In a real app, you would hash the password and compare with stored hash
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Return user info (excluding password)
      // Set session data
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      console.log('Received user registration request:', req.body);
      
      const userData = insertUserSchema.parse(req.body);
      
      // Validate password
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        console.log('Password validation failed:', passwordValidation.message);
        return res.status(400).json({ message: passwordValidation.message });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log('Username already exists:', userData.username);
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        console.log('Email already exists:', userData.email);
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password before storing
      const hashedPassword = await hashPassword(userData.password);
      
      // Generate mosque ID if user is admin
      let userDataWithHash = { ...userData, password: hashedPassword };
      if (userData.role === 'committee') {
        const mosqueId = generateMosqueId();
        userDataWithHash = { ...userDataWithHash, mosqueId };
      }
      
      const newUser = await storage.createUser(userDataWithHash);
      if (!newUser) {
        return res.status(500).json({ message: "Failed to create user" });
      }
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
      
      // Generate a unique mosque ID
      const mosqueIdentifier = generateMosqueId();
      const mosqueWithId = { 
        ...mosqueData, 
        mosqueIdentifier, 
        isVerified: false,
        verificationStatus: 'pending'
      };
      
      const newMosque = await storage.createMosque(mosqueWithId);
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

  // Get pending mosques for verification (admin only)
  app.get("/api/mosques/pending", requireAdmin, async (req: Request, res: Response) => {
    try {
      const pendingMosques = await storage.getPendingMosques();
      res.json(pendingMosques);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending mosques" });
    }
  });

  // Mosque verification endpoint (admin only)
  app.post("/api/mosques/:id/verify", requireAdmin, async (req: Request, res: Response) => {
    try {
      const mosqueId = parseInt(req.params.id);
      
      const mosque = await storage.getMosque(mosqueId);
      if (!mosque) {
        return res.status(404).json({ message: "Mosque not found" });
      }
      
      const verifiedMosque = await storage.verifyMosque(mosqueId);

      // Update the associated user's status
      if (mosque.createdBy) {
        await storage.updateUser(mosque.createdBy, {
          isVerified: true
        });
      }
      
      res.json(verifiedMosque);
    } catch (error) {
      res.status(500).json({ message: "Failed to update mosque verification status" });
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
      
      const prayerTimeData = {
        mosqueId,
        fajr: req.body.fajr,
        dhuhr: req.body.dhuhr,
        asr: req.body.asr,
        maghrib: req.body.maghrib,
        isha: req.body.isha,
        jummuah: req.body.jummuah,
        fajrAzaan: req.body.fajrAzaan,
        dhuhrAzaan: req.body.dhuhrAzaan,
        asrAzaan: req.body.asrAzaan,
        maghribAzaan: req.body.maghribAzaan,
        ishaAzaan: req.body.ishaAzaan,
        fajrDays: req.body.fajrDays,
        dhuhrDays: req.body.dhuhrDays,
        asrDays: req.body.asrDays,
        maghribDays: req.body.maghribDays,
        ishaDays: req.body.ishaDays
      };
      
      const validatedData = insertPrayerTimesSchema.parse(prayerTimeData);
      const newPrayerTimes = await storage.createPrayerTimes(validatedData);
      res.status(201).json(newPrayerTimes);
    } catch (error) {
      console.error("Prayer times creation error:", error);
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

  // Community routes
  app.post("/api/communities", async (req: Request, res: Response) => {
    try {
      const communityData = insertCommunitySchema.parse(req.body);
      const newCommunity = await storage.createCommunity(communityData);
      res.status(201).json(newCommunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to create community" });
    }
  });

  app.get("/api/communities", async (req: Request, res: Response) => {
    try {
      const { type, region, state, district } = req.query;
      const communities = await storage.getCommunities({ type, region, state, district });
      res.json(communities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch communities" });
    }
  });

  app.post("/api/communities/:id/join", async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.body.userId;
      await storage.joinCommunity(communityId, userId);
      res.status(200).json({ message: "Joined community successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join community" });
    }
  });

  app.post("/api/communities/:id/messages", async (req: Request, res: Response) => {
    try {
      const communityId = parseInt(req.params.id);
      const { userId, content } = req.body;
      const message = await storage.createCommunityMessage(communityId, userId, content);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
