import {
  formsApiTranslationUtils,
  normalizeAttachmentCodeFilter,
  SendinnCoverPageRequest,
  SendinnCoverPageResult,
} from '@navikt/skjemadigitalisering-shared-domain';
import { CoverPageService } from '../cover-page';
import { createSubsequentSubmissionDownloadData } from '../cover-page/subsequentSubmission';
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
    const loaded = await formService.getForm({
      formPath: request.formPath,
      revision: request.revision,
      language: request.language,
      attachmentFilter: normalizeAttachmentCodeFilter(request.attachmentFilter),
    });
    const translate = formsApiTranslationUtils.createTranslate(loaded.translations, loaded.language);
    const data = createSubsequentSubmissionDownloadData({
      form: loaded.form,
      submission: request.submission,
      language: loaded.language,
      translate,
    });
    const pdf = await coverPageService.downloadCoverPage({
      data,
      accessToken: await getAccessToken(),
      languageCode: loaded.language,
      translate,
    });
    return { pdf };
  };
  return { downloadCoverPage };
};

export { createSendinnCoverPageService };
export type { SendinnCoverPageService };
