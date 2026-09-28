import { getStatusFromErrorCode, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

type DraftOperation = 'create' | 'retrieve' | 'update' | 'submit' | 'fallback_update';

const getDraftFailureMetadata = (operation: DraftOperation, error: unknown) => {
  if (error instanceof ResponseError) {
    return {
      operation,
      errorCode: error.errorCode,
      status: error.errorCode === 'ERROR' ? 'UNKNOWN' : getStatusFromErrorCode(error.errorCode),
      ...(error.correlationId && { correlationId: error.correlationId }),
    };
  }

  return { operation, errorCode: 'UNCLASSIFIED_ERROR', status: 'UNKNOWN' };
};

const shouldLogDraftFailure = (error: unknown): boolean =>
  !(
    error instanceof ResponseError &&
    error.correlationId &&
    (error.errorCode === 'ERROR' || error.errorCode === 'INTERNAL_SERVER_ERROR')
  );

const getSubmissionFailureLog = (submitError: unknown, fallback?: { error: unknown }) => {
  if (!fallback) {
    return shouldLogDraftFailure(submitError)
      ? { message: 'Draft submission failed', metadata: getDraftFailureMetadata('submit', submitError) }
      : undefined;
  }

  return shouldLogDraftFailure(submitError) || shouldLogDraftFailure(fallback.error)
    ? {
        message: 'Draft persistence failed',
        metadata: {
          ...getDraftFailureMetadata('fallback_update', fallback.error),
          submissionFailure: getDraftFailureMetadata('submit', submitError),
        },
      }
    : undefined;
};

export { getDraftFailureMetadata, getSubmissionFailureLog, shouldLogDraftFailure };
