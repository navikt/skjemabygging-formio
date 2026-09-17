import { RequestHandler } from 'express';
import { appMetrics, captchaService, nologinTokenService } from '../../../services';
import { CAPTCHA_FAILURE_REASON, CaptchaError } from './types';

const getChallenge: RequestHandler = async (_req, res, next) => {
  try {
    res.json(captchaService.createChallenge());
  } catch (err) {
    next(err);
  }
};

const post: RequestHandler = async (req, res, next) => {
  try {
    appMetrics.nologinCaptchaRequestsCounter.inc();
    const { firstName } = req.body;

    if (firstName) {
      return next(new CaptchaError(CAPTCHA_FAILURE_REASON.HONEYPOT_FILLED));
    }

    const result = captchaService.verifySolution(req.body);
    if (!result.valid) {
      return next(new CaptchaError(result.reason));
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
