import { getStatusFromErrorCode, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import ApiError from './ApiError';

const isConflictError = (error: unknown): error is ResponseError =>
  error instanceof ResponseError && error.errorCode === 'CONFLICT';

const toApiError = (error: unknown): ApiError | undefined => {
  if (!(error instanceof ResponseError)) {
    return undefined;
  }

  return new ApiError(getStatusFromErrorCode(error.errorCode), error.message);
};

export { isConflictError, toApiError };
