type ErrorCode = 'ERROR' | 'FILE_TOO_MANY_PAGES' | 'SERVICE_UNAVAILABLE';

interface ErrorResponseBody {
  message: string;
  errorCode?: ErrorCode;
  correlation_id?: string;
}

export type { ErrorCode, ErrorResponseBody };
