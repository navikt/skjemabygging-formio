import { copyDependencyErrorFields, correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors/HttpError';
import { CorsError } from './types';

const getCorrelationId = (error: any) => error.correlationId ?? error.correlation_id ?? correlator.getId();

const cloneAsResponseError = (error: Error, responseError: ResponseError) => {
  responseError.stack = error.stack;
  return copyDependencyErrorFields(error, responseError);
};

const normalizeLegacyError = (error: any) => {
  if (error instanceof ResponseError) {
    if (error.correlationId) {
      return error;
    }

    return cloneAsResponseError(
      error,
      new ResponseError(error.errorCode, error.message, getCorrelationId(error), error.userMessage),
    );
  }

  if (error instanceof CorsError) {
    return cloneAsResponseError(
      error,
      new ResponseError('FORBIDDEN', error.message, getCorrelationId(error), error.message),
    );
  }

  if (error instanceof HttpError) {
    const message = error.functional ? error.message : 'Det oppstod en feil';
    return cloneAsResponseError(
      error,
      new ResponseError('INTERNAL_SERVER_ERROR', message, getCorrelationId(error), message),
    );
  }

  if (error instanceof Error) {
    return cloneAsResponseError(
      error,
      new ResponseError('INTERNAL_SERVER_ERROR', 'Det oppstod en feil', getCorrelationId(error), 'Det oppstod en feil'),
    );
  }

  return new ResponseError('INTERNAL_SERVER_ERROR', 'Det oppstod en feil', correlator.getId(), 'Det oppstod en feil');
};

// The client disconnected before the request body was received (body parser or multer).
const isClientAbort = (error: any, req: Request) =>
  req.destroyed === true &&
  req.complete === false &&
  (error?.type === 'request.aborted' || error?.message === 'Request aborted' || error?.message === 'Request closed');

const legacyErrorToResponseError = (error: any, req: Request, _res: Response, next: NextFunction) => {
  if (isClientAbort(error, req)) {
    return next(new ResponseError('BAD_REQUEST', 'Request aborted by client.', getCorrelationId(error)));
  }

  next(normalizeLegacyError(error));
};

export default legacyErrorToResponseError;
