import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import { logger } from '../../shared/logger/logger';

const handleAbortedRequest = (error: unknown, req: Request): boolean => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('type' in error) ||
    error.type !== 'request.aborted' ||
    !('status' in error) ||
    error.status !== 400 ||
    !(req.aborted || (req.destroyed && !req.complete))
  ) {
    return false;
  }

  logger.info({
    message: 'Request body was aborted.',
    correlationId: correlator.getId(),
    route: req.originalUrl?.split('?')[0],
  });
  return true;
};

// Install before application error adapters that replace the original parser error.
const requestAbortHandler = (error: unknown, req: Request, _res: Response, next: NextFunction) => {
  if (!handleAbortedRequest(error, req)) {
    next(error);
  }
};

export { handleAbortedRequest, requestAbortHandler };
