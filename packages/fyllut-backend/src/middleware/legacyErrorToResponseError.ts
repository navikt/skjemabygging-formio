import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/errors/HttpError';
import { CorsError } from './types';

const getCorrelationId = (error: any) => error.correlationId ?? error.correlation_id ?? correlator.getId();

const cloneAsResponseError = (error: Error, responseError: ResponseError) => {
  responseError.stack = error.stack;
  return responseError;
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

const legacyErrorToResponseError = (error: any, _req: Request, _res: Response, next: NextFunction) => {
  next(normalizeLegacyError(error));
};

export default legacyErrorToResponseError;
