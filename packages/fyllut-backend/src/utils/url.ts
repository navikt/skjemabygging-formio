import { Request } from 'express';
import { config } from '../config/config';

const isValidPath = (path: string) => {
  return /^[a-z0-9]+$/.test(path);
};

const getFyllutUrl = (req: Request) => {
  return config.isDevelopment
    ? `http://localhost:${config.port}${config.fyllutPath}`
    : `https://${req.get('host')}${config.fyllutPath}`;
};

const getCurrentUrl = (req: Request) => {
  return req.protocol + '://' + req.get('host') + req.originalUrl;
};

export { getCurrentUrl, getFyllutUrl, isValidPath };
