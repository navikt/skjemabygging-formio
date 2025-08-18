import cors, { CorsOptions } from 'cors';
import { config } from '../config/config';
import { CorsError } from './types';

const { isDevelopment } = config;

const isNavOrigin = /nav\.no$/;

const options = (originRegex: RegExp): CorsOptions => ({
  origin: (origin, callback) => {
    if (isDevelopment || (origin && originRegex.test(origin))) {
      callback(null, true);
    } else {
      callback(new CorsError(origin));
    }
  },
});

export const corsAllowNavOrigin = () => cors(options(isNavOrigin));
