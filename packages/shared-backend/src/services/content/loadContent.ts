import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import type { ContentSource } from './contentSource';

type ContentResource = 'form' | 'form translations' | 'global translations';

// fetch rejects with DOMException on timeout/abort and with TypeError carrying a cause on network failure.
// A TypeError without cause is a bug in our own code and must not be reported as an unavailable dependency.
const isUnreachableError = (error: unknown): error is Error =>
  (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) ||
  (error instanceof TypeError && error.cause !== undefined);

const loadContent = async <T>(resource: ContentResource, source: ContentSource, load: () => Promise<T>): Promise<T> => {
  const message = `Unable to load ${resource}`;
  try {
    return await load();
  } catch (error) {
    if (error instanceof ResponseError) {
      throw new ResponseError(
        error.errorCode === 'NOT_FOUND' ? 'NOT_FOUND' : 'SERVICE_UNAVAILABLE',
        message,
        error.correlationId,
      );
    }
    if (isUnreachableError(error)) {
      logger.warn(message, { resource, source, errorName: error.name });
      throw new ResponseError('SERVICE_UNAVAILABLE', message);
    }
    throw error;
  }
};

export { loadContent };
