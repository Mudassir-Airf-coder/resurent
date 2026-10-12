import { Request, Response, NextFunction } from 'express';

interface RateRecord {
  count: number;
  resetAt: number;
}

const clientIpMap = new Map<string, RateRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 180; // generous for local/preview testing, prevents automated spamming

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();

  let record = clientIpMap.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + WINDOW_MS };
    clientIpMap.set(ip, record);
    return next();
  }

  record.count++;
  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: {
        statusCode: 429,
        message: 'Too many requests from this IP. Please wait a moment before trying again.'
      }
    });
  }

  next();
}
