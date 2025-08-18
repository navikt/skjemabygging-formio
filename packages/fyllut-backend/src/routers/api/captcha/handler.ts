import { RequestHandler } from 'express';
import { appMetrics, nologinService } from '../../../services';
import { CaptchaError } from './types';

const post: RequestHandler = async (req, res, next) => {
  try {
    appMetrics.nologinCaptchaRequestsCounter.inc();
    const { firstName, data_33 } = req.body;

    if (firstName || data_33 !== 'ja') {
      return next(new CaptchaError('Captcha validation failed due to unexpected body', req.body));
    }

    const token = nologinService.generateToken();
    // TODO Vurder om innsendingsId hentes fra innsending-api
    const innsendingsId = crypto.randomUUID();
    res.json({ success: true, innsendingsId, access_token: token });
  } catch (err) {
    next(err);
  }
};

export default {
  post,
};
