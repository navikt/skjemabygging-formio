import { config } from './config/config';
import { QueryParamSub } from './types/custom';
import { getCurrentUrl } from './utils/url';

const { isDevelopment } = config;

const loginRedirect = (req, res, next) => {
  try {
    if (!isDevelopment) {
      const authHeader = req.header('Authorization');
      const sub = req.query.sub as QueryParamSub;

      if (sub === 'digital' && !authHeader) {
        return res.redirect(getCurrentUrl(req));
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (err: any) {
    next(err);
  }
};

export default loginRedirect;
