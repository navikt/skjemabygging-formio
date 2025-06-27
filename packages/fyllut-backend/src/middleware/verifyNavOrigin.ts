import { RequestHandler } from 'express';
import { config } from '../config/config';

const { isProduction } = config;

const verifyNavOrigin: RequestHandler = (req, res, next) => {
  const { origin } = req.headers;
  if (isProduction && (!origin || !origin?.endsWith('nav.no'))) {
    return res.sendStatus(403); // Forbidden
  }
  next();
};

export default verifyNavOrigin;
