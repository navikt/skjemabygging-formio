import { ErrorCode, getErrorCodeFromStatus, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import crypto from 'crypto';
import correlator from 'express-correlation-id';
import { logger } from '../logger/logger';

type MimeType =
  | 'application/json'
  | 'application/pdf'
  | 'application/octet-stream'
  | 'text/plain'
  | 'text/html'
  | 'multipart/form-data';

interface HttpOptions {
  contentType?: MimeType;
  accept?: MimeType;
  accessToken?: string;
  formRevisionId?: number;
  headers?: Record<string, string>;
}

const get = async <T>(url: string, options?: HttpOptions): Promise<T> => {
  logger.debug(`GET request to ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(defaultOptions(options)),
  });

  return handleResponse<T>(response);
};

const post = async <T>(url: string, body?: object, options?: HttpOptions): Promise<T> => {
  logger.debug(`POST request to ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders(defaultOptions(options)),
    body: createBody(body, defaultOptions(options)),
  });

  return handleResponse(response);
};

const put = async <T>(url: string, body?: object, options?: HttpOptions): Promise<T> => {
  logger.debug(`PUT request to ${url}`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: createHeaders(defaultOptions(options)),
    body: createBody(body, defaultOptions(options)),
  });

  return handleResponse(response);
};

const httpDelete = async <T>(url: string, body?: object, options?: HttpOptions): Promise<T> => {
  logger.debug(`DELETE request to ${url}`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: createHeaders(defaultOptions(options)),
    body: createBody(body, defaultOptions(options)),
  });

  return handleResponse(response);
};

const createHeaders = (options?: HttpOptions): HeadersInit => {
  const { accessToken, contentType, accept, formRevisionId, headers } = options ?? {};

  return {
    'x-correlation-id': correlator.getId() ?? crypto.randomUUID(),
    ...(contentType && { 'Content-Type': contentType.toString() }),
    ...(accept && { Accept: accept.toString() }),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(formRevisionId && { 'Formsapi-Entity-Revision': `${formRevisionId}` }),
    ...(headers && headers),
  };
};

const createBody = (body?: any, options?: HttpOptions): BodyInit | undefined => {
  if (body && typeof body === 'object' && options?.contentType === 'application/json') {
    return JSON.stringify(body);
  }

  return body;
};

const isResponseType = (response: Response, mimeType: MimeType) => {
  return response.headers.get('Content-Type')?.includes(mimeType);
};

const stringToBase64 = (str: any) => {
  return Buffer.from(str).toString('base64');
};

const defaultOptions = (options?: HttpOptions): HttpOptions => ({
  contentType: 'application/json',
  ...options,
});

const handleBody = async (response: Response) => {
  try {
    // TODO fjern når riktig header på merge kallet
    if (response.url.includes('merge')) {
      return stringToBase64(await response.arrayBuffer());
    }

    if (isResponseType(response, 'application/json')) {
      return await response.json();
    } else if (isResponseType(response, 'text/plain') || isResponseType(response, 'text/html')) {
      return response.text();
    } else if (isResponseType(response, 'application/octet-stream') || isResponseType(response, 'application/pdf')) {
      return stringToBase64(await response.arrayBuffer());
    } else {
      return response;
    }
  } catch (_) {
    // This catch helps to handle UND_ERR_SOCKET errors that we can ignore.
  }
};

const isErrorCode = (value: unknown): value is ErrorCode => {
  return (
    value === 'ERROR' ||
    value === 'WARNING' ||
    value === 'CONFLICT' ||
    value === 'FILE_TOO_MANY_PAGES' ||
    value === 'BAD_REQUEST' ||
    value === 'UNAUTHORIZED' ||
    value === 'TOO_MANY_REQUESTS' ||
    value === 'FORBIDDEN' ||
    value === 'NOT_FOUND' ||
    value === 'METHOD_NOT_ALLOWED' ||
    value === 'LOGIN_TIMEOUT' ||
    value === 'INTERNAL_SERVER_ERROR' ||
    value === 'SERVICE_UNAVAILABLE'
  );
};

const createResponseError = (response: Response, errorBody: unknown) => {
  const message =
    typeof errorBody === 'string'
      ? errorBody
      : typeof errorBody === 'object' && errorBody && 'message' in errorBody && typeof errorBody.message === 'string'
        ? errorBody.message
        : response.statusText;

  const errorCode =
    typeof errorBody === 'object' && errorBody && 'errorCode' in errorBody && isErrorCode(errorBody.errorCode)
      ? errorBody.errorCode
      : getErrorCodeFromStatus(response.status);

  const correlationId =
    typeof errorBody === 'object' &&
    errorBody &&
    'correlation_id' in errorBody &&
    typeof errorBody.correlation_id === 'string'
      ? errorBody.correlation_id
      : undefined;

  const userMessage =
    typeof errorBody === 'object' &&
    errorBody &&
    'userMessage' in errorBody &&
    typeof errorBody.userMessage === 'string'
      ? errorBody.userMessage
      : undefined;

  return new ResponseError(errorCode, message, correlationId, userMessage);
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return await handleBody(response);
  }

  const errorBody = await handleBody(response);
  const error = createResponseError(response, errorBody);

  logger.warn(`Http request to ${response.url} failed with status ${response.status}`, {
    body: errorBody,
  });

  throw error;
};

const http = {
  get,
  post,
  put,
  delete: httpDelete,
};

export default http;
