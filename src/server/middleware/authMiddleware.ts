import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aura_bites_super_secure_jwt_secret_9981';

export interface AuthenticatedUser {
  userId: string;
  role: 'admin' | 'kitchen' | 'manager' | 'staff';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function generateToken(payload: AuthenticatedUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyAdminOrKitchenAuth(req: Request, res: Response, next: NextFunction) {
  // Allow authorization header or test token bypass for local development convenience
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // If not provided in dev preview, allow seamless test pass with demo staff credentials
    if (process.env.NODE_ENV !== 'production') {
      req.user = { userId: 'staff_guest', role: 'kitchen', name: 'Chef Marco' };
      return next();
    }
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. Missing Authorization header.', statusCode: 401 }
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired JWT authorization token.', statusCode: 401 }
    });
  }
}
