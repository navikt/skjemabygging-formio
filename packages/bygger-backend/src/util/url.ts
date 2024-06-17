import { Request } from 'express';
import config from '../config';

export const getByggerUrl = (req: Request) => {
  return config.isDevelopment ? `http://localhost:${config.port}` : `https://${req.get('host')}`;
};
