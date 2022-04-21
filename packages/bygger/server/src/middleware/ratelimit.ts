import rateLimit from "express-rate-limit";

const MS_ONE_MINUTE = 60 * 1000;

export const rateLimiter = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: "Too many requests from IP",
    standardHeaders: true,
    legacyHeaders: false,
  });

export const fsAccessRateLimiter = rateLimiter(MS_ONE_MINUTE, 60);
