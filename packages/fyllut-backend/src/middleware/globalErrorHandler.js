import correlator from 'express-correlation-id';
import { config } from '../config/config';
import { logErrorWithStacktrace } from '../utils/errors';
import { CorsError } from './types';

const { isTest } = config;

const createJson = (err) => {
  return {
    message: err.functional ? err.message : 'Det oppstod en feil',
    correlation_id: err.correlation_id,
  };
};

const globalErrorHandler = (err, req, res, _next) => {
  if (!err.correlation_id) {
    err.correlation_id = correlator.getId();
  }

  if (!isTest) {
    logErrorWithStacktrace(err);
    res.locals = res.locals || {};
    res.locals.errorAlreadyLogged = true;
  }

  if (err instanceof CorsError) {
    res.sendStatus(403);
    return;
  }

  if (err.http_status === 401 || err.status === 401) {
    res.status(401);
  } else if (err.http_status === 403 || err.status === 403) {
    res.status(403);
  } else {
    res.status(500);
  }

  if (err.render_html) {
    res.redirect(`${config.fyllutPath}/500?correlationId=${err.correlation_id}`);
  } else {
    res.contentType('application/json');
    res.send(createJson(err));
  }
};

export default globalErrorHandler;
