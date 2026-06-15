import { ErrorCode, ResponseError, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
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
  redirect?: RequestRedirect;
  responseType?: 'metadata' | 'stream';
}

type HttpMetadataResponse<T> = {
  status: number;
  headers: Record<string, string>;
  body?: T;
};

type HttpStreamResponse = {
  status: number;
  headers: Record<string, string>;
  body: ReadableStream<Uint8Array>;
};

function get(url: string, options: HttpOptions & { responseType: 'stream' }): Promise<HttpStreamResponse>;
function get<T>(url: string, options: HttpOptions & { responseType: 'metadata' }): Promise<HttpMetadataResponse<T>>;
function get<T>(url: string, options?: HttpOptions): Promise<T>;
async function get<T>(url: string, options?: HttpOptions): Promise<T | HttpMetadataResponse<T> | HttpStreamResponse> {
  logger.debug(`GET request to ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: createHeaders(defaultOptions(options)),
    redirect: options?.redirect,
  });

  return handleResponse<T>(response, options);
}

function post<T>(
  url: string,
  body: object | undefined,
  options: HttpOptions & { responseType: 'metadata' },
): Promise<HttpMetadataResponse<T>>;
function post<T>(url: string, body?: object, options?: HttpOptions): Promise<T>;
async function post<T>(url: string, body?: object, options?: HttpOptions): Promise<T | HttpMetadataResponse<T>> {
  logger.debug(`POST request to ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders(defaultOptions(options)),
    body: createBody(body, defaultOptions(options)),
    redirect: options?.redirect,
  });

  return (await handleResponse<T>(response, options)) as T | HttpMetadataResponse<T>;
}

function put<T>(
  url: string,
  body: object | undefined,
  options: HttpOptions & { responseType: 'metadata' },
): Promise<HttpMetadataResponse<T>>;
function put<T>(url: string, body?: object, options?: HttpOptions): Promise<T>;
async function put<T>(url: string, body?: object, options?: HttpOptions): Promise<T | HttpMetadataResponse<T>> {
  logger.debug(`PUT request to ${url}`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: createHeaders(defaultOptions(options)),
    body: createBody(body, defaultOptions(options)),
    redirect: options?.redirect,
  });

  return (await handleResponse<T>(response, options)) as T | HttpMetadataResponse<T>;
}

function httpDelete<T>(
  url: string,
  body: object | undefined,
  options: HttpOptions & { responseType: 'metadata' },
): Promise<HttpMetadataResponse<T>>;
function httpDelete<T>(url: string, body?: object, options?: HttpOptions): Promise<T>;
async function httpDelete<T>(url: string, body?: object, options?: HttpOptions): Promise<T | HttpMetadataResponse<T>> {
  logger.debug(`DELETE request to ${url}`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: createHeaders(defaultOptions(options)),
    body: createBody(body, defaultOptions(options)),
    redirect: options?.redirect,
  });

  return (await handleResponse<T>(response, options)) as T | HttpMetadataResponse<T>;
}

function postMultipart<T>(
  url: string,
  body: FormData,
  options: HttpOptions & { responseType: 'metadata' },
): Promise<HttpMetadataResponse<T>>;
function postMultipart<T>(url: string, body: FormData, options?: HttpOptions): Promise<T>;
async function postMultipart<T>(
  url: string,
  body: FormData,
  options?: HttpOptions,
): Promise<T | HttpMetadataResponse<T>> {
  logger.debug(`POST multipart request to ${url}`);
  const multipartOptions = defaultOptions(options);
  const { contentType: _contentType, ...optionsWithoutContentType } = multipartOptions;
  const response = await fetch(url, {
    method: 'POST',
    headers: createHeaders(optionsWithoutContentType),
    body,
    redirect: options?.redirect,
  });

  return (await handleResponse<T>(response, options)) as T | HttpMetadataResponse<T>;
}

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

const getHeaders = (response: Response) =>
  Object.fromEntries(Array.from(response.headers.entries()).map(([key, value]) => [key.toLowerCase(), value]));

const isManualRedirectResponse = (response: Response, options?: HttpOptions) =>
  options?.redirect === 'manual' && response.status >= 300 && response.status < 400;

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

const handleResponse = async <T>(
  response: Response,
  options?: HttpOptions,
): Promise<T | HttpMetadataResponse<T> | HttpStreamResponse> => {
  if (options?.responseType === 'stream' && response.ok) {
    return {
      status: response.status,
      headers: getHeaders(response),
      body: response.body as ReadableStream<Uint8Array>,
    };
  }

  if (response.ok || isManualRedirectResponse(response, options)) {
    if (options?.responseType === 'metadata' || isManualRedirectResponse(response, options)) {
      return {
        status: response.status,
        headers: getHeaders(response),
        body: response.ok ? await handleBody(response) : undefined,
      };
    }

    return await handleBody(response);
  }

  const errorBody = await handleBody(response);
  const upstreamErrorCode = getUpstreamErrorCode(errorBody);
  const errorCode = getNormalizedErrorCode(response.status, upstreamErrorCode);
  const userMessage = getUserMessage(errorCode);
  const error = new ResponseError(
    errorCode,
    response.statusText,
    response.headers.get('x-correlation-id') ?? undefined,
    userMessage,
  );

  logger.warn(`Http request to ${response.url} failed with status ${response.status}`, {
    body: errorBody,
    errorCode,
    upstreamErrorCode,
  });

  throw error;
};

const getUpstreamErrorCode = (errorBody: unknown): string | undefined => {
  if (
    errorBody &&
    typeof errorBody === 'object' &&
    'errorCode' in errorBody &&
    typeof errorBody.errorCode === 'string'
  ) {
    return errorBody.errorCode;
  }
};

const getNormalizedErrorCode = (status: number, upstreamErrorCode?: string): ErrorCode => {
  switch (upstreamErrorCode) {
    case 'illegalAction.applicationSentInOrDeleted':
      return 'NOT_FOUND';
    case 'illegalAction.fileWithTooManyPages':
      return 'FILE_TOO_MANY_PAGES';
    case 'temporarilyUnavailable':
      return 'SERVICE_UNAVAILABLE';
    default:
      return getErrorCode(status);
  }
};

const getUserMessage = (errorCode: ErrorCode): string | undefined => {
  switch (errorCode) {
    case 'FILE_TOO_MANY_PAGES':
      return TEXTS.statiske.uploadFile.uploadFileToManyPagesError;
    case 'SERVICE_UNAVAILABLE':
      return TEXTS.statiske.nologin.temporarilyUnavailable;
    default:
      return undefined;
  }
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
  postMultipart,
  put,
  delete: httpDelete,
};

export default http;
export type { HttpMetadataResponse, HttpStreamResponse };
