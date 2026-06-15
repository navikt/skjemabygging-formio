import { ErrorCode, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

const isResponseError = (error: unknown): error is ResponseError => error instanceof ResponseError;

const hasErrorCode = (error: unknown, errorCode: ErrorCode) => isResponseError(error) && error.errorCode === errorCode;

const wrapResponseError = ({
  error,
  errorCode,
  message,
  userMessage,
}: {
  error: ResponseError;
  errorCode?: ErrorCode;
  message: string;
  userMessage?: string;
}) => new ResponseError(errorCode ?? error.errorCode, message, error.correlationId, userMessage ?? error.userMessage);

export { hasErrorCode, isResponseError, wrapResponseError };
