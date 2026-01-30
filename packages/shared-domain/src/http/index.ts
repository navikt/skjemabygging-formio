type ErrorCode =
  | 'ERROR' // Default error code
  | 'FILE_TOO_MANY_PAGES' // Too many pages in PDF
  | 'BAD_REQUEST' // Http 400
  | 'UNAUTHORIZED' // Http 401
  | 'FORBIDDEN' // Http 403
  | 'NOT_FOUND' // Http 404
  | 'SERVICE_UNAVAILABLE'; // Http 503

interface ErrorResponse {
  message: string;
  status: number;
  errorCode: ErrorCode;
  correlationId?: string;
  userMessage?: string;
}

export type { ErrorCode, ErrorResponse };
