import rateLimit from 'express-rate-limit';

export const rateLimiter = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: 'Too many requests from IP',
    standardHeaders: true,
    legacyHeaders: false,
  });
