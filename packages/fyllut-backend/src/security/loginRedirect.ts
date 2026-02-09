import { urlUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config/config';
import { QueryParamSub } from '../types/custom';

const { isDevelopment } = config;

const loginRedirect = (req, res, next) => {
  try {
    if (!isDevelopment) {
      const authHeader = req.header('Authorization');
      const sub = req.query.sub as QueryParamSub;

      if (sub === 'digital' && !authHeader) {
        return res.redirect(`${urlUtil.getBaseUrl(req)}/fyllut/oauth2/login?redirect=${urlUtil.getCurrentUrl(req)}`);
      }
    }

    next();
  } catch (err: any) {
    next(err);
  }
};

export default loginRedirect;
