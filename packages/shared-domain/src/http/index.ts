type ErrorCode =
  | 'ERROR' // Default error code
  | 'WARNING' // Default warning code
  | 'FILE_TOO_MANY_PAGES' // Too many pages in PDF
  | 'BAD_REQUEST' // Http 400
  | 'UNAUTHORIZED' // Http 401
  | 'FORBIDDEN' // Http 403
  | 'NOT_FOUND' // Http 404
  | 'INTERNAL_SERVER_ERROR' // Http 500
  | 'SERVICE_UNAVAILABLE'; // Http 503

interface ErrorResponse {
  message: string;
  errorCode: ErrorCode;
  userMessage?: string;
  correlation_id?: string;
}

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
    this.errorCode = errorCode;
    this.correlationId = correlationId;
    this.userMessage = userMessage;
  }
}

export { ResponseError };
export type { ErrorCode, ErrorResponse };
