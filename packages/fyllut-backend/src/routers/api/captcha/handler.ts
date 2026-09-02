import { RequestHandler } from 'express';
import { config } from '../../../config/config';
import { appMetrics, nologinTokenService } from '../../../services';
import { createChallenge, verifySolution } from './challengeService';
import { CAPTCHA_FAILURE_REASON, CaptchaError } from './types';

const getChallenge: RequestHandler = async (req, res, next) => {
  try {
    res.json(createChallenge(req.ip));
  } catch (err) {
    next(err);
  }
};

const post: RequestHandler = async (req, res, next) => {
  try {
    appMetrics.nologinCaptchaRequestsCounter.inc();
    const { firstName, data_33 } = req.body;

    if (firstName) {
      return next(new CaptchaError(CAPTCHA_FAILURE_REASON.HONEYPOT_FILLED));
    }

    if (config.captcha.powEnabled) {
      const result = verifySolution(req.body, req.ip);
      if (!result.valid) {
        return next(new CaptchaError(result.reason));
      }
    } else if (data_33 !== 'ja') {
      // TODO: remove old data_33 flow after PoW confirmed stable in production
      return next(new CaptchaError(CAPTCHA_FAILURE_REASON.UNEXPECTED_LEGACY_BODY));
    }

    const token = nologinTokenService.generateToken();
    res.json({ success: true, access_token: token });
  } catch (err) {
    next(err);
  }
};

export default {
  getChallenge,
  post,
};
