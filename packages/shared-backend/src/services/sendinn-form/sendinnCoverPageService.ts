import {
  formsApiTranslationUtils,
  normalizeAttachmentCodeFilter,
  SendinnCoverPageRequest,
  SendinnCoverPageResult,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageMapper, CoverPageService } from '../cover-page';
import { SendinnFormService } from './sendinnFormService';

interface SendinnCoverPageService {
  downloadCoverPage: (request: SendinnCoverPageRequest) => Promise<SendinnCoverPageResult>;
}

const createSendinnCoverPageService = ({
  formService,
  coverPageService,
  getAccessToken,
}: {
  formService: SendinnFormService;
  coverPageService: CoverPageService;
  getAccessToken: () => Promise<string>;
}): SendinnCoverPageService => {
  const downloadCoverPage: SendinnCoverPageService['downloadCoverPage'] = async (request) => {
    const { form, language, translations } = await formService.getForm({
      formPath: request.formPath,
      revision: request.revision,
      language: request.language,
      attachmentFilter: normalizeAttachmentCodeFilter(request.attachmentFilter),
    });
    const translate = formsApiTranslationUtils.createTranslate(translations, language);
    const data = coverPageMapper.createDownloadDataFromSubmission({
      form,
      submission: request.submission,
      type: 'ETTERSENDELSE',
      languageCode: language,
      unitNumber: submissionUtils.getFirstAnsweredValueByType(form.components, 'navUnitSelect', request.submission),
      translate,
    });
    const pdfBase64 = await coverPageService.downloadCoverPage({
      data,
      accessToken: await getAccessToken(),
      languageCode: language,
      translate,
    });
    return { pdfBase64 };
  };
  return { downloadCoverPage };
};

export { createSendinnCoverPageService };
export type { SendinnCoverPageService };
