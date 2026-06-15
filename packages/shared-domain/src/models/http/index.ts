type ErrorCode =
  | 'ERROR' // Default error code
  | 'WARNING' // Default warning code
  | 'CONFLICT' // Http 409
  | 'FILE_TOO_MANY_PAGES' // Too many pages in PDF
  | 'BAD_REQUEST' // Http 400
  | 'UNAUTHORIZED' // Http 401
  | 'TOO_MANY_REQUESTS' // Http 429
  | 'FORBIDDEN' // Http 403
  | 'NOT_FOUND' // Http 404
  | 'METHOD_NOT_ALLOWED' // Http 405
  | 'LOGIN_TIMEOUT' // Http 440
  | 'INTERNAL_SERVER_ERROR' // Http 500
  | 'SERVICE_UNAVAILABLE'; // Http 503

interface ErrorResponse {
  message: string;
  errorCode: ErrorCode;
  userMessage?: string;
  correlation_id?: string;
}

const getErrorCodeFromStatus = (status: number): ErrorCode => {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 405:
      return 'METHOD_NOT_ALLOWED';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 440:
      return 'LOGIN_TIMEOUT';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'ERROR';
  }
};

const getStatusFromErrorCode = (errorCode: ErrorCode): number => {
  switch (errorCode) {
    case 'BAD_REQUEST':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'METHOD_NOT_ALLOWED':
      return 405;
    case 'CONFLICT':
      return 409;
    case 'TOO_MANY_REQUESTS':
      return 429;
    case 'LOGIN_TIMEOUT':
      return 440;
    case 'INTERNAL_SERVER_ERROR':
      return 500;
    case 'SERVICE_UNAVAILABLE':
      return 503;
    default:
      return 500;
  }
};

class ResponseError extends Error {
  public readonly errorCode: ErrorCode;
  public readonly userMessage: string | undefined;
  public readonly correlationId: string | undefined;

  /**
   * @param errorCode     Specific error code, will affect logging level and status code.
   * @param message       Internal english error message for logging and debugging, but it is visible in error response.
   * @param correlationId Send inn correlation id.
   * @param userMessage   Message intended for the end user and to be used in the translate() function.
   */
  constructor(errorCode: ErrorCode, message: string, correlationId?: string, userMessage?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.errorCode = errorCode;
    this.correlationId = correlationId;
    this.userMessage = userMessage;
  }
}

export { ResponseError, getErrorCodeFromStatus, getStatusFromErrorCode };
export type { ErrorCode, ErrorResponse };
