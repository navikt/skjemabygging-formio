import { ErrorCode, getStatusFromErrorCode } from '@navikt/skjemadigitalisering-shared-domain';
import ApiError from './ApiError';

const getResponseErrorData = (error: unknown): { errorCode: ErrorCode; message: string } | undefined => {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('errorCode' in error) ||
    typeof error.errorCode !== 'string' ||
    !('message' in error) ||
    typeof error.message !== 'string'
  ) {
    return undefined;
  }

  return {
    errorCode: error.errorCode as ErrorCode,
    message: error.message,
  };
};

const isConflictError = (error: unknown): boolean => getResponseErrorData(error)?.errorCode === 'CONFLICT';

const toApiError = (error: unknown): ApiError | undefined => {
  const responseError = getResponseErrorData(error);
  if (!responseError) {
    return undefined;
  }

  return new ApiError(getStatusFromErrorCode(responseError.errorCode), responseError.message);
};

export { isConflictError, toApiError };
