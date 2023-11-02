import correlator from 'express-correlation-id';
import { config } from '../config/config';
import { logger } from '../logger.js';

const { isTest } = config;

const globalErrorHandler = (err, req, res, _next) => {
  if (!err.correlation_id) {
    err.correlation_id = correlator.getId();
  }

  if (!isTest) {
    const { message, stack, ...errDetails } = err;
    logger.error(message, { stack, ...errDetails });
  }

  res.status(500);
  res.contentType('application/json');
  res.send({ message: err.functional ? err.message : 'Det oppstod en feil', correlation_id: err.correlation_id });
};

export default globalErrorHandler;
