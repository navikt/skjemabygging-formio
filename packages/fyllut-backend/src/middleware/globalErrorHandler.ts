import { correlator, HttpResponseError } from '@navikt/skjemadigitalisering-shared-backend';
import { ErrorCode, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../config/config';
import { logErrorWithStacktrace } from '../utils/errors';
import { CorsError } from './types';

const { isTest } = config;

const getStatusFromErrorCode = (errorCode: ErrorCode): number => {
  switch (errorCode) {
    case 'BAD_REQUEST':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'INTERNAL_SERVER_ERROR':
      return 500;
    case 'SERVICE_UNAVAILABLE':
      return 503;
    default:
      return 500;
  }
};

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

  if (err instanceof ResponseError) {
    const status = getStatusFromErrorCode(err.errorCode);
    res
      .status(status)
      .contentType('application/json')
      .send({
        message: err.message,
        errorCode: err.errorCode,
        correlation_id: err.correlationId,
        userMessage: err.userMessage,
        ...(err instanceof HttpResponseError && err.body !== undefined ? { body: err.body } : {}),
      });
    return;
  }

  res.status(500);

  res.contentType('application/json');
  res.send(createJson(err));
};

export default globalErrorHandler;
