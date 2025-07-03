import express from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import session from "express-session";

async function startServer() {
  try {    const app = express();
    const port = process.env.PORT || 3001;

    // Request logging middleware
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });    // CORS configuration
    app.use(cors({
      origin: 'http://localhost:5177',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register API routes
  const server = await registerRoutes(app);
  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body
    });
    
    // Handle different types of errors
    if (err.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: err.errors 
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }
    
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'Internal server error'
    });
  });
  // Start server
  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

startServer().catch(console.error);
