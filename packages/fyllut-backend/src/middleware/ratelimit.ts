import rateLimit from 'express-rate-limit';

export const rateLimiter = (windowMs: number, limit: number) =>
  rateLimit({
    windowMs,
    limit,
    message: 'Too many requests from IP',
    standardHeaders: false,
    legacyHeaders: false,
  });
