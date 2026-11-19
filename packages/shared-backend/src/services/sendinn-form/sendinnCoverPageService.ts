import {
  Form,
  formsApiTranslationUtils,
  normalizeAttachmentCodeFilter,
  SendinnCoverPageRequest,
  SendinnCoverPageResult,
  Submission,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { coverPageMapper, CoverPageService } from '../cover-page';
import { SendinnFormService } from './sendinnFormService';

interface SendinnCoverPageService {
  downloadCoverPage: (request: SendinnCoverPageRequest) => Promise<SendinnCoverPageResult>;
}

// mottaksadresseId is not used: it is unclear whether a form's recipient also applies to ettersending.
// Hidden Nav unit fields are cleared by the renderer, so only the visible one has an answer.
const getNavUnit = (form: Form, submission: Submission) =>
  submissionUtils
    .flattenComponentsWithPath(form.components)
    .filter(({ component }) => component.type === 'navUnitSelect')
    .map(({ submissionPath }) => submissionUtils.getSubmissionValue(submissionPath, submission))
    .find(Boolean) as string | undefined;

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
      unitNumber: getNavUnit(form, request.submission),
      translate,
    });
    const pdf = await coverPageService.downloadCoverPage({
      data,
      accessToken: await getAccessToken(),
      languageCode: language,
      translate,
    });
    return { pdf };
  };
  return { downloadCoverPage };
};

export { createSendinnCoverPageService };
export type { SendinnCoverPageService };
