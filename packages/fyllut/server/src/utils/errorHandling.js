import correlator from "express-correlation-id";
import { logger } from "../logger";

/**
 *
 * @param response
 * @param errorMessage Error message
 * @param functional true if error message should be visible to human user
 * @returns {Promise<Error>}
 */
async function responseToError(response, errorMessage, functional = false) {
  const contentType = response.headers.get("content-type");
  const error = new Error(errorMessage);
  error.functional = functional;
  error.http_response_body = contentType?.includes("application/json") ? await response.json() : await response.text();
  error.http_url = response.url;
  error.http_status = response.status;
  error.correlation_id = correlator.getId();
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
    const error = await responseToError(response, errorMessage, functional);
    logger.error(error.http_response_body);
    throw error;
  };

export { responseToError, toJsonOrThrowError };
