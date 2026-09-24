import { getResponseErrorData, getStatusFromErrorCode, hasErrorCode } from '@navikt/skjemadigitalisering-shared-domain';
import ApiError from './ApiError';

const isConflictError = (error: unknown): boolean => hasErrorCode(error, 'CONFLICT');

const toApiError = (error: unknown): ApiError | undefined => {
  const responseError = getResponseErrorData(error);
  if (!responseError) {
    return undefined;
  }

  return new ApiError(getStatusFromErrorCode(responseError.errorCode), responseError.message);
};

export { hasErrorCode, isConflictError, toApiError };
