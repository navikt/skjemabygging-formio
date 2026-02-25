import { ErrorCode, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
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
  const { accessToken, contentType, accept, formRevisionId } = options ?? {};

  return {
    'x-correlation-id': correlator.getId() ?? crypto.randomUUID(),
    ...(contentType && { 'Content-Type': contentType.toString() }),
    ...(accept && { Accept: accept.toString() }),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(formRevisionId && { 'Formsapi-Entity-Revision': `${formRevisionId}` }),
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
    } else if (isResponseType(response, 'application/octet-stream')) {
      return stringToBase64(await response.arrayBuffer());
    } else {
      return response;
    }
  } catch (_) {
    // This catch helps to handle UND_ERR_SOCKET errors that we can ignore.
  }
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return await handleBody(response);
  }

  const errorBody = await handleBody(response);
  const error = new HttpResponseError(getErrorCode(response.status), response.statusText, errorBody);

  logger.warn(`Http request to ${response.url} failed with status ${response.status}`, {
    body: errorBody,
  });

  throw error;
};

class HttpResponseError extends ResponseError {
  public readonly body: any;

  constructor(errorCode: ErrorCode, message: string, body: any, userMessage?: string) {
    super(errorCode, message, userMessage);
    this.body = body;
  }
}

const getErrorCode = (status: number): ErrorCode => {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'ERROR';
  }
};

const http = {
  get,
  post,
  put,
  delete: httpDelete,
};

export default http;
