import express from 'express';
import { config } from '../../../config/config';
import { rateLimiter } from '../../../middleware/ratelimit';
import verifyNavOrigin from '../../../middleware/verifyNavOrigin';
import captchaErrorHandler from './errorHandler';
import captchaHandler from './handler';

const RATE_LIMIT = config.isTest ? 1000 : 5; // Allow more requests in test environment

const captchaRouter = express.Router();

captchaRouter.all('*', verifyNavOrigin, rateLimiter(60000, RATE_LIMIT));
captchaRouter.get('/', captchaHandler.get);
captchaRouter.post('/', captchaHandler.post);
captchaRouter.use(captchaErrorHandler);

export default captchaRouter;
