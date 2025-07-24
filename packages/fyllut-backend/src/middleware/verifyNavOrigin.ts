import { RequestHandler } from 'express';
import { config } from '../config/config';
import { logger } from '../logger';

const { isProduction } = config;

const verifyNavOrigin: RequestHandler = (req, res, next) => {
  const { origin } = req.headers;
  if (isProduction && (!origin || !origin?.endsWith('nav.no'))) {
    logger.info(`Unauthorized request from origin: ${origin}`);
    return res.sendStatus(403); // Forbidden
  }
  next();
};

export default verifyNavOrigin;
