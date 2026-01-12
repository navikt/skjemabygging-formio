import { ErrorCode } from '@navikt/skjemadigitalisering-shared-domain';

enum MimeType {
  JSON = 'application/json',
  TEXT = 'text/plain',
  PDF = 'application/pdf',
  MULTIPART_FORM_DATA = 'multipart/form-data',
  OCTET_STREAM = 'application/octet-stream',
}

enum SubmissionMethodType {
  DIGITAL = 'digital',
  PAPER = 'paper',
}

interface FetchHeader {
  'Content-Type'?: MimeType;
  Accept?: MimeType;
  'Fyllut-Submission-Method'?: SubmissionMethodType;
  'x-jwt-token'?: string; // formio token when invoking formio api directly
  'x-innsendingsid'?: string;
  NologinToken?: string;
}

interface FetchOptions {
  redirectToLocation?: boolean;
  setRedirectLocation?: (location: string) => void;
}

class HttpError extends Error {
  public readonly status: number;
  public readonly errorCode: ErrorCode | undefined;

  constructor(message: string, status: number, errorCode?: ErrorCode | undefined) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

class UnauthenticatedError extends Error {}
class TooManyRequestsError extends Error {}
class TooManyPagesError extends Error {}

const defaultHeaders = (headers?: FetchHeader) => {
  return {
    'Content-Type': MimeType.JSON,
    Accept: MimeType.JSON,
    ...headers,
  };
};

const get = async <T>(url: string, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders(headers),
  });

  return await handleResponse(response, opts);
};

const post = async <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: defaultHeaders(headers),
    body: JSON.stringify(body),
  });

  return await handleResponse(response, opts);
};

const postFile = async <T>(url: string, body: FormData, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: MimeType.JSON,
      ...headers,
    },
    body,
  });

  return await handleResponse(response, opts);
};

const httpDelete = async <T>(url: string, body?: object, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: defaultHeaders(headers),
    body: JSON.stringify(body),
  });

  return await handleResponse(response, opts);
};

const put = async <T>(url: string, body: object, headers?: FetchHeader, opts?: FetchOptions): Promise<T> => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: defaultHeaders(headers),
    body: JSON.stringify(body),
  });

  return await handleResponse(response, opts);
};

const handleResponse = async (response: Response, opts?: FetchOptions) => {
  if (!response.ok) {
    // Formio API server returns status 440 when token is expired
    if (response.status === 401 || response.status === 403 || response.status === 440) {
      throw new UnauthenticatedError(response.statusText);
    } else if (response.status === 429) {
      throw new TooManyRequestsError(response.statusText);
    }

    let errorMessage: string = '';
    let errorCode;
    if (isResponseType(response, MimeType.JSON)) {
      const responseJson = await response.json();
      if (responseJson.message) {
        errorMessage = responseJson.message;
      }
      if (responseJson.errorCode) {
        errorCode = responseJson.errorCode;
      }
    } else if (isResponseType(response, MimeType.TEXT)) {
      errorMessage = await response.text();
    }

    if (errorCode === 'FILE_TOO_MANY_PAGES') {
      throw new TooManyPagesError(errorMessage);
    }

    throw new HttpError(errorMessage || response.statusText, response.status, errorCode);
  }

  if (opts?.redirectToLocation || opts?.setRedirectLocation) {
    const location = response.headers.get('Location');
    const { status } = response;
    if (location && (status === 201 || (status >= 300 && status <= 399))) {
      if (opts.setRedirectLocation) {
        opts.setRedirectLocation(location);
      } else {
        window.location.href = location;
      }
    }
  }

  if (isResponseType(response, MimeType.JSON)) {
    return response.json();
  } else if (isResponseType(response, MimeType.TEXT)) {
    return await response.text();
  } else if (isResponseType(response, MimeType.PDF) || isResponseType(response, MimeType.OCTET_STREAM)) {
    return await response.blob();
  } else {
    return response;
  }
};

const isResponseType = (response: Response, mimeType: MimeType) => {
  const contentType = response.headers.get('Content-Type');
  return contentType && contentType.includes(mimeType);
};

const http = {
  get,
  post,
  put,
  postFile,
  delete: httpDelete,
  MimeType,
  HttpError,
  UnauthenticatedError,
  TooManyRequestsError,
  TooManyPagesError,
  SubmissionMethodType,
};

export default http;

export type { FetchHeader, FetchOptions };
