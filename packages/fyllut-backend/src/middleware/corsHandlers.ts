import cors, { CorsOptions } from 'cors';
import { config } from '../config/config';
import { CorsError } from './types';

const { isDevelopment } = config;

const isNavOrigin = /nav\.no$/;

const options = (originRegex: RegExp, allowMissingOrigin = false): CorsOptions => ({
  origin: (origin, callback) => {
    if (isDevelopment || (allowMissingOrigin && !origin) || (origin && originRegex.test(origin))) {
      callback(null, true);
    } else {
      callback(new CorsError(origin));
    }
  },
});

export const corsAllowNavOrigin = () => cors(options(isNavOrigin));

// Same origin requests from the browser (e.g. GET) do not include an Origin header
export const corsAllowNavOrSameOrigin = () => cors(options(isNavOrigin, true));
