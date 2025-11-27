import type { Response as NodeFetchResponse } from 'node-fetch';
import { HttpError } from './errors/HttpError';

async function responseToError(response: Response | NodeFetchResponse, errorMessage: string, functional = false) {
  const error = new HttpError(errorMessage, functional);
  await error.applyResponse(response);
  return error;
}

function htmlResponseError(message) {
  return new HttpError(message, false, true);
}

const toJsonOrThrowError =
  (errorMessage, functional = false) =>
  async (response) => {
    if (response.ok) {
      return response.json();
    }
    throw await responseToError(response, errorMessage, functional);
  };

export { htmlResponseError, responseToError, toJsonOrThrowError };
