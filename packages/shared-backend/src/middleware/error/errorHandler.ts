import { ErrorCode, ErrorResponse, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import { logger } from '../../shared/logger/logger';

const createErrorResponse = (error: any): ErrorResponse => {
  return {
    message: error.message ?? 'Internal Server Error',
    errorCode: error.errorCode ?? 'ERROR',
    correlation_id: error.correlationId ?? correlator.getId(),
    userMessage: error.userMessage ?? TEXTS.statiske.error.serverErrorTitle,
  };
};

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

const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  const errorResponse = createErrorResponse(error);

  if (errorResponse.errorCode === 'ERROR' || errorResponse.errorCode === 'INTERNAL_SERVER_ERROR') {
    logger.error(errorResponse);
    res.locals = res.locals || {};
    res.locals.errorAlreadyLogged = true;
  } else {
    logger.warn(errorResponse);
  }

  if (errorResponse.correlation_id) {
    res.header('x-correlation-id', errorResponse.correlation_id);
  }

  res.contentType('application/json').status(getStatusFromErrorCode(errorResponse.errorCode)).send(errorResponse);
};

export default errorHandler;
