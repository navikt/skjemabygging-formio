import { ErrorResponseBody } from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import { config } from '../config/config';
import { logErrorWithStacktrace } from '../utils/errors';
import { FunctionalError } from '../utils/errors/FunctionalError';
import { HttpError } from '../utils/errors/HttpError';
import { CorsError } from './types';

const { isTest } = config;

const createJson = (err: any): ErrorResponseBody => {
  const defaultMessage = 'Det oppstod en feil';
  if (err instanceof HttpError) {
    return {
      message: err.functional ? err.message : defaultMessage,
      errorCode: err.error_code,
      correlation_id: err.correlation_id,
    };
  } else if (err instanceof FunctionalError) {
    return {
      message: err.functional ? err.message : defaultMessage,
      correlation_id: err.correlation_id,
    };
  }

  return {
    message: err.functional ? err.message : defaultMessage,
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

  if (err.http_status === 400 || err.http_status === 401 || err.http_status === 403) {
    res.status(err.http_status);
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
