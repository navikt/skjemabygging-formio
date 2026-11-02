import {
  convertToSendinnPaperForm,
  ResponseError,
  SendinnFormRequest,
  SendinnFormResult,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ContentService } from '../content';

interface SendinnFormService {
  getForm: (request: SendinnFormRequest) => Promise<SendinnFormResult>;
}

const createSendinnFormService = ({
  contentService,
}: {
  contentService: Pick<ContentService, 'getForm' | 'getTranslations'>;
}): SendinnFormService => {
  const getForm: SendinnFormService['getForm'] = async ({ formPath, language, attachmentFilter }) => {
    const source = await contentService.getForm({ formPath });
    if (source.path !== formPath) {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid form identity');
    }
    const subsequentSubmissionTypes = source.properties.subsequentSubmissionTypes;
    if (!Array.isArray(subsequentSubmissionTypes) || !subsequentSubmissionTypes.includes('PAPER')) {
      throw new ResponseError('NOT_FOUND', 'Paper subsequent submission is unavailable');
    }

    const languages = source.languages;
    if (!languages?.includes('nb')) {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid form language metadata');
    }
    const selectedLanguage = languages.includes(language) ? language : 'nb';
    const translations = await (async () => {
      if (selectedLanguage === 'nb') return {};
      try {
        return await contentService.getTranslations({ formPath, languageCode: selectedLanguage });
      } catch (error) {
        if (error instanceof ResponseError && error.errorCode === 'NOT_FOUND') {
          throw new ResponseError('SERVICE_UNAVAILABLE', 'Unable to load form translations', error.correlationId);
        }
        throw error;
      }
    })();

    return {
      form: convertToSendinnPaperForm(source, { attachmentFilter }),
      languages,
      language: selectedLanguage,
      translations,
      attachmentFilter: [...attachmentFilter],
    };
  };

  return { getForm };
};

export { createSendinnFormService };
export type { SendinnFormService };
