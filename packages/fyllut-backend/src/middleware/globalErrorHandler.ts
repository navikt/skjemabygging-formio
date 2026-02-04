import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
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

  res.status(500);

  res.contentType('application/json');
  res.send(createJson(err));
};

export default globalErrorHandler;
