import {
  FORM_NOT_PUBLISHED_MESSAGE,
  getStatusFromErrorCode,
  INVALID_FORM_PATH_MESSAGE,
  ResponseError,
} from '@navikt/skjemadigitalisering-shared-domain';

const classifyFormFetchError = (path: string, error: unknown) => {
  if (!(error instanceof ResponseError)) {
    return { report: true, status: 'unknown' };
  }

  const { errorCode, message, correlationId } = error;
  const status = error.status ?? (errorCode === 'ERROR' ? 'unknown' : getStatusFromErrorCode(errorCode));
  const expectedInvalidPath = errorCode === 'BAD_REQUEST' && message === INVALID_FORM_PATH_MESSAGE;
  // A NAV-looking form may be unexpectedly absent from the deployed directory.
  const expectedMissingForm =
    errorCode === 'NOT_FOUND' && message === FORM_NOT_PUBLISHED_MESSAGE && !/^nav\d{6}/.test(path);

  return {
    report:
      !expectedInvalidPath &&
      !expectedMissingForm &&
      !((errorCode === 'ERROR' || errorCode === 'INTERNAL_SERVER_ERROR') && correlationId),
    status,
    errorCode,
    correlationId,
  };
};

const logFormFetchError = (
  logger: { error: (message: string, metadata?: object) => void } | undefined,
  path: string,
  error: unknown,
) => {
  const { report, status, correlationId } = classifyFormFetchError(path, error);
  if (report) {
    logger?.error('Fyllut form fetch failed', {
      operation: 'form-fetch',
      status,
      correlationId,
    });
  }
};

export { classifyFormFetchError, logFormFetchError };
