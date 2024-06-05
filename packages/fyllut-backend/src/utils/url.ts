import { Request } from 'express';
import { config } from '../config/config';

export const getFyllutUrl = (req: Request) => {
  return config.isDevelopment
    ? `http://localhost:${config.port}${config.fyllutPath}`
    : `https://${req.get('host')}${config.fyllutPath}`;
};
