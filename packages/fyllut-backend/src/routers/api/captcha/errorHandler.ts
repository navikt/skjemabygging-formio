import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../logger';
import { CaptchaError } from './types';

const captchaErrorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CaptchaError) {
    logger.info(`Captcha error: ${err.message} - body: ${JSON.stringify(err.reqBody)}`);
    return res.status(400).json({ error: 'Captcha failed' });
  }
  next(err);
};

export default captchaErrorHandler;
