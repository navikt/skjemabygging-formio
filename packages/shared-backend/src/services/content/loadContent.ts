import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import type { ContentSource } from './contentSource';

type ContentResource = 'form' | 'form translations' | 'global translations';

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
    if (error instanceof TypeError || error instanceof DOMException) {
      logger.warn(message, { resource, source, errorName: error.name });
      throw new ResponseError('SERVICE_UNAVAILABLE', message);
    }
    throw error;
  }
};

export { loadContent };
