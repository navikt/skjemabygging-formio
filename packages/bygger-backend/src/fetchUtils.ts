import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import { logger } from './logging/logger';

export class HttpError extends Error {
  readonly response: Response;
  readonly bodyErrorMessage?: string;

  constructor(fetchResponse: Response, bodyErrorMessage?: string) {
    super(`${fetchResponse.status} ${fetchResponse.statusText} fetching: ${fetchResponse.url}`);
    this.name = this.constructor.name;
    this.response = fetchResponse;
    this.bodyErrorMessage = bodyErrorMessage;
  }
}

const parseBody = async (res: Response): Promise<unknown | string> => {
  const contentType = res.headers.get('content-type');
  return contentType?.includes('application/json') ? await res.json() : await res.text();
};

export async function fetchWithErrorHandling(url: RequestInfo, options: RequestInit) {
  const method = options.method || 'GET';
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    const { message, stack, ...errDetails } = err;
    const logMeta = { errorMessage: message, stack, ...errDetails, url, method };
    logger.error(`Fetch ${method} ${url} threw error`, logMeta);
    throw err;
  }
  if (!res.ok) {
    const responseBody = await parseBody(res);
    const logMeta = {
      responseBody,
      status: res.status,
      method,
    };
    logger.error(`Fetch ${method} ${url} failed`, logMeta);
    throw new HttpError(res);
  }
  if (res.status === 204) {
    return {
      status: 'OK',
      data: null,
    };
  }
  if (res.headers.get('content-type')?.includes('application/json')) {
    return {
      status: 'OK',
      data: await res.json(),
    };
  } else if (
    res.headers.get('content-type')?.includes('application/pdf') ||
    res.headers.get('content-type')?.includes('application/octet-stream')
  ) {
    return {
      status: 'OK',
      data: stringTobase64(await res.arrayBuffer()),
    };
  }

  const logMeta = { status: res.status, method };
  logger.warn(`Fetch ${method} ${url}: Unexpected content-type "${res.headers.get('content-type')}"`, logMeta);
  return {
    status: 'OK',
    data: null,
  };
}

export function stringTobase64(str: any) {
  return Buffer.from(str).toString('base64');
}

export function base64ToString(str: string) {
  return Buffer.from(str, 'base64').toString();
}
