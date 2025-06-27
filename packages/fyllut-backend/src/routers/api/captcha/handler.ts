import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config';
import { appMetrics } from '../../../services';
import { CaptchaError } from './types';

const { nologin } = config;

const CAPTCHA_MIN_COMPLETION_TIME_SECONDS = 3;
const CAPTCHA_MAX_REQUEST_AGE_MINUTES = 2;
const CAPTCHA_MAX_SUBMIT_FUTURE_SECONDS = 5;

// Denne er ikke produksjonsklar! Vi må legge til noe randomiserte greier.
const handler: RequestHandler = (req, res, next) => {
  try {
    appMetrics.nologinCaptchaRequestsCounter.inc();
    const { timestampRender, timestampSubmit, data_33, firstName } = req.body;

    if (data_33 !== 'ja' || firstName || !timestampRender || !timestampSubmit) {
      return next(new CaptchaError('Captcha validation failed due to unexpected body', req.body));
    }

    const earliestAllowedSubmit = dateUtils.add('seconds', CAPTCHA_MIN_COMPLETION_TIME_SECONDS, timestampRender)!;
    if (dateUtils.isBefore(timestampSubmit, earliestAllowedSubmit)) {
      return next(new CaptchaError('Captcha request completed too fast', req.body));
    }

    const now = dateUtils.getIso8601String();
    const minSubmitTime = dateUtils.add('minutes', -CAPTCHA_MAX_REQUEST_AGE_MINUTES, now)!;
    const maxSubmitTime = dateUtils.add('seconds', CAPTCHA_MAX_SUBMIT_FUTURE_SECONDS, now)!;
    if (dateUtils.isBefore(timestampSubmit, minSubmitTime) || dateUtils.isAfter(timestampSubmit, maxSubmitTime)) {
      return next(new CaptchaError('Captcha timestamps are suspicious', req.body));
    }

    const token = jwt.sign({ purpose: 'nologin' }, nologin.jwtSecret, { expiresIn: '2h' });
    res.json({ success: true, access_token: token });
  } catch (err) {
    next(err);
  }
};

export default handler;
