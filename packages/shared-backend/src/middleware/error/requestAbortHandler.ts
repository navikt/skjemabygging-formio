import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import { logger } from '../../shared/logger/logger';

type RequestAbortLogContext = {
  fieldName?: string;
  submissionId?: Request['params'][string];
  attachmentId?: Request['params'][string];
};

const requestAbortLogContexts = new WeakMap<Request, RequestAbortLogContext>();

// Express restores route parameters before application-level error middleware runs.
const setRequestAbortLogContext = (req: Request, context: RequestAbortLogContext): void => {
  requestAbortLogContexts.set(req, { ...context });
};

const handleAbortedRequest = (error: unknown, req: Request): boolean => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !(req.aborted || (req.destroyed && !req.complete)) ||
    ('storageErrors' in error && Array.isArray(error.storageErrors) && error.storageErrors.length > 0)
  ) {
    return false;
  }

  const isParserAbort =
    'type' in error && error.type === 'request.aborted' && 'status' in error && error.status === 400;
  const isMultipartAbort =
    error instanceof Error &&
    !('type' in error) &&
    !('status' in error) &&
    !('code' in error) &&
    !('errorCode' in error) &&
    ((req.aborted && error.message === 'Request aborted') ||
      (req.destroyed && !req.complete && error.message === 'Request closed')) &&
    req.is('multipart/form-data');
  if (!isParserAbort && !isMultipartAbort) {
    return false;
  }

  const logContext = requestAbortLogContexts.get(req);
  logger.info({
    ...(logContext
      ? {
          fieldName: logContext.fieldName,
          innsendingsId: logContext.submissionId,
          attachmentId: logContext.attachmentId,
        }
      : {}),
    message: 'Request body was aborted.',
    correlationId: correlator.getId(),
    route: req.originalUrl?.split('?')[0],
  });
  return true;
};

// Install before application error adapters that replace the original parser or upload error.
const requestAbortHandler = (error: unknown, req: Request, _res: Response, next: NextFunction) => {
  if (!handleAbortedRequest(error, req)) {
    next(error);
  }
};

export { handleAbortedRequest, requestAbortHandler, setRequestAbortLogContext };
export type { RequestAbortLogContext };
