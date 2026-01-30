import { ErrorResponse, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';

const createErrorResponse = (error: any): ErrorResponse => {
  return {
    message: error.message ?? 'Internal Server Error',
    status: error.status ?? 500,
    errorCode: error.errorCode ?? 'ERROR',
    correlationId: error.correlationId ?? correlator.getId(),
    userMessage: error.userMessage ?? TEXTS.statiske.error.serverErrorTitle,
  };
};

const errorHandler = (error, _req: Request, res: Response, _next: NextFunction) => {
  const errorResponse = createErrorResponse(error);

  res.contentType('application/json').status(errorResponse.status).send(errorResponse);
};

export default errorHandler;
