import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { logger } from '../../../logger';
import { appMetrics } from '../../../services';
import { CaptchaError } from './types';

const captchaErrorHandler: ErrorRequestHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CaptchaError) {
    logger.info(`Captcha error: ${err.message} - body: ${JSON.stringify(err.reqBody)}`);
    appMetrics.nologinCaptchaFailuresCounter.inc();
    res.status(400).json({ error: 'Captcha failed' });
    return;
  }
  next(err);
};

export default captchaErrorHandler;
