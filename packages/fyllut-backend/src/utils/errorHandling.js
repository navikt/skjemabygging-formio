import correlator from 'express-correlation-id';
import { v4 as uuidv4 } from 'uuid';

/**
 *
 * @param response
 * @param errorMessage Error message
 * @param functional true if error message should be visible to human user
 * @returns {Promise<Error>}
 */
async function responseToError(response, errorMessage, functional = false) {
  const contentType = response.headers.get('content-type');
  const error = new Error(errorMessage);
  error.functional = functional;
  error.http_response_body = contentType?.includes('application/json') ? await response.json() : await response.text();
  error.http_url = response.url;
  error.http_status = response.status;
  error.correlation_id = correlator.getId() ?? uuidv4();
  return error;
}

function synchronousResponseToError(errorMessage, body, status, url, functional = false) {
  const error = new Error(errorMessage);
  error.functional = functional;
  error.http_response_body = body;
  error.http_url = url;
  error.http_status = status;
  error.correlation_id = correlator.getId() ?? uuidv4();
  return error;
}

/**
 * @param errorMessage Error message
 * @param functional true if error message should be visible to human user
 * @returns {(function(*): Promise<*|undefined>)|*}
 */
const toJsonOrThrowError =
  (errorMessage, functional = false) =>
  async (response) => {
    if (response.ok) {
      return response.json();
    }
    throw await responseToError(response, errorMessage, functional);
  };

export { responseToError, synchronousResponseToError, toJsonOrThrowError };
