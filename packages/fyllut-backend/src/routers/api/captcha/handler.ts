import { RequestHandler } from 'express';
import { appMetrics, nologinTokenService } from '../../../services';
import { createChallenge, verifySolution } from './challengeService';
import { CAPTCHA_FAILURE_REASON, CaptchaError } from './types';

const isLegacyRequest = ({ data_33, nonce, difficulty, expiresAt, signature, solution }: Record<string, unknown>) =>
  data_33 === 'ja' &&
  [nonce, difficulty, expiresAt, signature, solution].every((challengeProperty) => challengeProperty === undefined);

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
    const { firstName } = req.body;

    if (firstName) {
      return next(new CaptchaError(CAPTCHA_FAILURE_REASON.HONEYPOT_FILLED));
    }

    // TODO: remove the legacy data_33 path after already-loaded frontends have aged out.
    if (!isLegacyRequest(req.body)) {
      const result = verifySolution(req.body, req.ip);
      if (!result.valid) {
        return next(new CaptchaError(result.reason));
      }
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
