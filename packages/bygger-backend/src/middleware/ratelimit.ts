import rateLimit from 'express-rate-limit';
import config from '../config';

const MS_ONE_MINUTE = 60 * 1000;
// Local runs (pnpm start/preview) use NODE_ENV=development. Cypress loads the app more than 60 times per minute there.
const FS_ACCESS_LIMIT = config.isDevelopment ? 1000 : 60;

const rateLimiter = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: 'Too many requests from IP',
    standardHeaders: true,
    legacyHeaders: false,
  });

const fsAccessRateLimiter = rateLimiter(MS_ONE_MINUTE, FS_ACCESS_LIMIT);

export { fsAccessRateLimiter, rateLimiter };
