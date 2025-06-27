import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config';
import { appMetrics } from '../../../services';
import { CaptchaError } from './types';

const { nologin } = config;

const MINIMUM_CAPTCHA_COMPLETION_TIME_SECONDS = 3;
const MAXIMUM_CAPTCHA_REQUEST_TIME_MINUTES = 2;
const MAXIMUM_SUBMIT_FUTURE_SECONDS = 5;

// Denne er ikke produksjonsklar! Vi må legge til noe randomiserte greier.
const handler: RequestHandler = (req, res, next) => {
  try {
    appMetrics.nologinCaptchaRequestsCounter.inc();
    const { body } = req;
    const { timestampRender, timestampSubmit, data_33, firstName } = body;
    const now = dateUtils.getIso8601String();
    if (data_33 !== 'ja' || firstName || !timestampRender || !timestampSubmit) {
      return next(new CaptchaError('Captcha validation failed due to unexpected body', body));
    }
    const earliestAllowedSubmitTimestamp = dateUtils.add(
      'seconds',
      MINIMUM_CAPTCHA_COMPLETION_TIME_SECONDS,
      timestampRender,
    )!;
    if (timestampRender && dateUtils.isBefore(timestampSubmit, earliestAllowedSubmitTimestamp)) {
      return next(new CaptchaError('Captcha request completed too fast', body));
    }

    const suspiciousSubmitInThePast = dateUtils.add('minutes', -MAXIMUM_CAPTCHA_REQUEST_TIME_MINUTES, now)!;
    const suspiciousSubmitInTheFuture = dateUtils.add('seconds', MAXIMUM_SUBMIT_FUTURE_SECONDS, now)!;
    if (
      dateUtils.isAfter(suspiciousSubmitInThePast, timestampSubmit) ||
      dateUtils.isAfter(timestampSubmit, suspiciousSubmitInTheFuture)
    ) {
      return next(new CaptchaError('Captcha timestamps are suspicious', body));
    }

    const token = jwt.sign({ purpose: 'nologin' }, nologin.jwtSecret, { expiresIn: '2h' });
    res.json({ success: true, access_token: token });
  } catch (err) {
    next(err);
  }
};

export default handler;
