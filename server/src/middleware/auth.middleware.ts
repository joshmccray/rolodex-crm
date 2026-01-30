import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      ctx?: {
        userId: string;
        organizationId: string;
        role: 'owner' | 'admin' | 'agent';
        email: string;
      };
    }
  }
}

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = verifyToken(token);
      req.ctx = {
        userId: payload.userId,
        organizationId: payload.organizationId,
        role: payload.role,
        email: payload.email,
      };
      next();
    } catch {
      res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      });
    }
  } catch {
    res.status(500).json({
      code: 'AUTH_ERROR',
      message: 'Authentication error',
    });
  }
};

// Middleware to require admin or owner role
export const requireAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.ctx) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
    return;
  }

  if (req.ctx.role !== 'admin' && req.ctx.role !== 'owner') {
    res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Admin or owner access required',
    });
    return;
  }

  next();
};

// Middleware to require owner role
export const requireOwner: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.ctx) {
    res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
    return;
  }

  if (req.ctx.role !== 'owner') {
    res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Owner access required',
    });
    return;
  }

  next();
};
