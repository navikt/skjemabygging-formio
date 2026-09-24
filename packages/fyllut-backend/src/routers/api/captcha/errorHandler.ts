import { ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { logger } from '../../../logger';
import { appMetrics } from '../../../services';
import { CAPTCHA_FAILURE_REASON_TEXT, CaptchaError } from './types';

const captchaErrorHandler: ErrorRequestHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CaptchaError) {
    logger.info('Captcha validation failed', { reason: CAPTCHA_FAILURE_REASON_TEXT[err.reason] });
    appMetrics.nologinCaptchaFailuresCounter.inc({ reason: err.reason });
    next(new ResponseError('BAD_REQUEST', 'Captcha failed', undefined, TEXTS.statiske.uploadFile.uploadFileError));
    return;
  }
  next(err);
};

export default captchaErrorHandler;
