import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import ApiError from '../../../api/ApiError';
import { getTranslationHttpError, TranslationError } from './errorUtils';

const saveEachTranslation = async <Translation extends FormsApiTranslation>(
  translations: Translation[],
  saveTranslation: (translation: Translation) => Promise<Translation>,
): Promise<{
  responses: Translation[];
  errors: TranslationError[];
}> => {
  const results = await Promise.all(
    translations.map(async (translation: Translation) => {
      try {
        return { response: await saveTranslation(translation) };
      } catch (error) {
        if (error instanceof ApiError) {
          return { error: getTranslationHttpError(error.httpStatus, translation) };
        } else {
          throw error;
        }
      }
    }),
  );

  return {
    responses: results.flatMap((result) => (result.response ? result.response : [])),
    errors: results.flatMap((result) => (result.error ? result.error : [])),
  };
};

export { saveEachTranslation };
