import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

const loadContent = async <T>(load: () => Promise<T>): Promise<T> => {
  try {
    return await load();
  } catch (error) {
    if (error instanceof ResponseError) {
      throw new ResponseError(
        error.errorCode === 'NOT_FOUND' ? 'NOT_FOUND' : 'SERVICE_UNAVAILABLE',
        'Unable to load forms-api content',
        error.correlationId,
      );
    }
    if (error instanceof TypeError || error instanceof DOMException) {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Unable to load forms-api content');
    }
    throw error;
  }
};

export { loadContent };
