import { RequestHandler } from 'express';
import { config } from '../../../config/config';
import { appMetrics, nologinTokenService } from '../../../services';
import { createChallenge, verifySolution } from './challengeService';
import { CaptchaError } from './types';

const getChallenge: RequestHandler = async (_req, res, next) => {
  try {
    res.json(createChallenge());
  } catch (err) {
    next(err);
  }
};

const post: RequestHandler = async (req, res, next) => {
  try {
    appMetrics.nologinCaptchaRequestsCounter.inc();
    const { firstName, data_33 } = req.body;

    if (firstName) {
      return next(new CaptchaError('Captcha validation failed, honeypot was filled in', req.body));
    }

    if (config.captcha.powEnabled) {
      const result = verifySolution(req.body);
      if (!result.valid) {
        return next(new CaptchaError(`Captcha validation failed, ${result.reason}`, req.body));
      }
    } else if (data_33 !== 'ja') {
      // TODO: remove old data_33 flow after PoW confirmed stable in production
      return next(new CaptchaError('Captcha validation failed due to unexpected body', req.body));
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
