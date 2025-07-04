import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import type { Mosque } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { mosques } from '../../shared/schema';

// Extend Express Request type to include mosque
declare global {
  namespace Express {
    interface Request {
      mosque?: Mosque;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || req.session.role !== 'committee') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function validateMosqueId(req: Request, res: Response, next: NextFunction) {
  const mosqueId = req.body.mosqueId;

  // Only require mosque ID for mosque admin (committee)
  if (req.body.userType === 'committee' && !mosqueId) {
    return res.status(400).json({
      message: "Mosque ID is required for mosque administrators"
    });
  }

  if (mosqueId) {
    // Validate mosque ID format
    const mosqueIdPattern = /^MSQ\d{9}$/;
    if (!mosqueIdPattern.test(mosqueId)) {
      return res.status(400).json({
        message: "Invalid mosque ID format. The ID should start with 'MSQ' followed by 9 digits"
      });
    }

    // Check if mosque exists and is verified
    const [mosque] = await db.select()
      .from(mosques)
      .where(eq(mosques.mosqueIdentifier, mosqueId));

    if (!mosque) {
      return res.status(404).json({
        message: "Mosque not found. Please check the ID and try again"
      });
    }

    if (!mosque.isVerified) {
      return res.status(403).json({
        message: "This mosque is pending verification. Please wait for admin approval"
      });
    }

    // Add mosque to request for use in other middleware
    req.mosque = mosque;
  }

  next();
}
