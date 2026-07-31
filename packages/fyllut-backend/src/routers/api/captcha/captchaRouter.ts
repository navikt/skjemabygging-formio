import express from 'express';
import { config } from '../../../config/config';
import { corsAllowNavOrigin, corsAllowNavOrSameOrigin } from '../../../middleware/corsHandlers';
import { rateLimiter } from '../../../middleware/ratelimit';
import captchaErrorHandler from './errorHandler';
import captchaHandler from './handler';

const RATE_LIMIT = config.isTest || config.mocksEnabled ? 1000 : 20;

const captchaRouter = express.Router();

captchaRouter.all('*path', rateLimiter(60000, RATE_LIMIT));
captchaRouter.get('/challenge', corsAllowNavOrSameOrigin(), captchaHandler.getChallenge);
captchaRouter.post('/', corsAllowNavOrigin(), captchaHandler.post);
captchaRouter.use(captchaErrorHandler);

export default captchaRouter;
