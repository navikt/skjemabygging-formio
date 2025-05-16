import { Request } from 'express';
import { config } from '../config/config';

export function isValidPath(path: string) {
  return /^[a-z0-9]+$/.test(path);
}

export const getFyllutUrl = (req: Request) => {
  return config.isDevelopment
    ? `http://localhost:${config.port}${config.fyllutPath}`
    : `https://${req.get('host')}${config.fyllutPath}`;
};
