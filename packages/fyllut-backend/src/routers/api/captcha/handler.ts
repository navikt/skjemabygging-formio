import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config';
import { appMetrics } from '../../../services';
import { CaptchaError } from './types';

const { nologin } = config;

const post: RequestHandler = async (req, res, next) => {
  try {
    appMetrics.nologinCaptchaRequestsCounter.inc();
    const { firstName, data_33 } = req.body;

    if (firstName || data_33 !== 'ja') {
      return next(new CaptchaError('Captcha validation failed due to unexpected body', req.body));
    }

    const token = jwt.sign({ purpose: 'nologin' }, nologin.jwtSecret, { expiresIn: '2h' });
    res.json({ success: true, access_token: token });
  } catch (err) {
    next(err);
  }
};

export default {
  post,
};
