import fetch, { HeadersInit, Response, RequestInfo, RequestInit } from "node-fetch";
import { logger } from "../logger";

interface RetryInit {
  retry?: number;
  retryDelay?: number;
}

type RequestInitWithRetry = RequestInit & RetryInit;

const DEFAULT_RETRY = 3;
const DEFAULT_RETRY_DELAY_MS = 5000;

const fetchWithRetry = (url: RequestInfo, init: RequestInitWithRetry): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const maxRetries = init.retry || DEFAULT_RETRY;
    const retryDelay = init.retryDelay || DEFAULT_RETRY_DELAY_MS;
    const urlLogMeta = { url, method: init.method };
    const fetchWrapper = async (retryNo: number) => {
      if (retryNo > 1) {
        logger.info(`Fetch retry, attempt number ${retryNo} of ${maxRetries}...`, urlLogMeta);
      }
      try {
        const response = await fetch(url, init);
        if (retryNo > 1) {
          logger.info(`Fetch successful at retry attempt number ${retryNo} of ${maxRetries}`, {
            ...urlLogMeta,
            httpStatus: response.status,
          });
        }
        return resolve(response);
      } catch (error: any) {
        if (retryNo === maxRetries) {
          logger.warn(`Giving up after ${maxRetries} retries`, urlLogMeta);
          return reject(error);
        }
        logger.warn(`Fetch failed with error, will retry in ${retryDelay} ms...`, {
          errorMessage: error.message,
          ...urlLogMeta,
        });
      }
      await delay(retryDelay);
      return await fetchWrapper(++retryNo);
    };
    return fetchWrapper(1);
  });
};

const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type { HeadersInit };

export default fetchWithRetry;
