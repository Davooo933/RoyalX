import type { Request, Response, NextFunction } from 'express';

const buckets = new Map<string, { tokens: number; last: number }>();

export function simpleRateLimit({ capacity = 30, refillPerSec = 10 }: { capacity?: number; refillPerSec?: number } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { tokens: capacity, last: now };
    const elapsed = (now - bucket.last) / 1000;
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillPerSec);
    bucket.last = now;
    if (bucket.tokens < 1) {
      buckets.set(key, bucket);
      return res.status(429).json({ error: 'rate_limited' });
    }
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    next();
  };
}

