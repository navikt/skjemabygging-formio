import { ErrorCode, ErrorResponse, getStatusFromErrorCode, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import { logger } from '../../shared/logger/logger';

const createErrorResponse = (error: any): ErrorResponse => {
  return {
    message: error.message ?? 'Internal Server Error',
    errorCode: error.errorCode ?? 'ERROR',
    correlationId: error.correlationId ?? correlator.getId(),
    userMessage: error.userMessage ?? TEXTS.statiske.error.serverErrorTitle,
  };
};

const getHttpStatusFromErrorCode = (errorCode: ErrorCode): number =>
  errorCode === 'FILE_TOO_MANY_PAGES' ? 400 : getStatusFromErrorCode(errorCode);

const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  const errorResponse = createErrorResponse(error);

  if (errorResponse.errorCode === 'ERROR' || errorResponse.errorCode === 'INTERNAL_SERVER_ERROR') {
    logger.error({
      ...errorResponse,
      stackTrace: error.stack,
    });
    res.locals = res.locals || {};
    res.locals.errorAlreadyLogged = true;
  } else {
    logger.warn(errorResponse);
  }

  if (errorResponse.correlationId) {
    res.header('x-correlation-id', errorResponse.correlationId);
  }

  res.contentType('application/json').status(getHttpStatusFromErrorCode(errorResponse.errorCode)).send(errorResponse);
};

export default errorHandler;
