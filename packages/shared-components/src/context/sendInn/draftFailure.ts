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

export { getDraftFailureMetadata };
