import { ErrorCode, ErrorResponse } from '@navikt/skjemadigitalisering-shared-domain';
import crypto from 'crypto';
import correlator from 'express-correlation-id';
import { logger } from '../logger/logger';

type MimeType =
  | 'application/json'
  | 'application/pdf'
  | 'application/octet-stream'
  | 'text/plain'
  | 'multipart/form-data';

interface HttpOptions {
  contentType?: MimeType;
  accept?: MimeType;
  accessToken?: string;
  formRevisionId?: number;
}

const get = async <T>(url: string, options?: HttpOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders({
      contentType: 'application/json',
      ...options,
    }),
  });

  return handleResponse<T>(response);
};

const post = async <T>(url: string, body?: object, options?: HttpOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders({
      contentType: 'application/json',
      ...options,
    }),
    body: createBody(body, options),
  });

  return handleResponse(response);
};

const put = async <T>(url: string, body?: object, options?: HttpOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: createHeaders({
      contentType: 'application/json',
      ...options,
    }),
    body: createBody(body, options),
  });

  return handleResponse(response);
};

const httpDelete = async <T>(url: string, body?: object, options?: HttpOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: createHeaders({
      contentType: 'application/json',
      ...options,
    }),
    body: createBody(body, options),
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
  return options?.contentType === 'application/json' ? JSON.stringify(body) : body;
};

const isResponseType = (response: Response, mimeType: MimeType) => {
  return response.headers.get('Content-Type')?.includes(mimeType);
};

const stringToBase64 = (str: any) => {
  return Buffer.from(str).toString('base64');
};

const handleBody = async (response: Response) => {
  try {
    if (isResponseType(response, 'application/json')) {
      return await response.json();
    } else if (isResponseType(response, 'text/plain')) {
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

  const error: HttpErrorResponse = {
    message: response.statusText,
    status: response.status,
    errorCode: getErrorCode(response.status),
    body: await handleBody(response),
  };

  logger.error(error);

  throw error;
};

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
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'ERROR';
  }
};

interface HttpErrorResponse extends ErrorResponse {
  body: any;
}

const http = {
  get,
  post,
  put,
  delete: httpDelete,
};

export default http;
