import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { HttpError } from './errors/HttpError';

async function responseToError(response: any, errorMessage: string, functional = false) {
  const contentType = response.headers.get('content-type');
  const error = new HttpError(errorMessage);
  error.functional = functional;
  error.http_response_body = contentType?.includes('application/json') ? await response.json() : await response.text();
  error.http_url = response.url;
  error.http_status = response.status;
  error.correlation_id = correlator.getId();
  return error;
}

const toJsonOrThrowError =
  (errorMessage: string, functional = false) =>
  async (response) => {
    if (response.ok) {
      return response.json();
    }
    throw await responseToError(response, errorMessage, functional);
  };

export { responseToError, toJsonOrThrowError };
