import { renderApplicationPdf, translationUtil } from '@navikt/skjemadigitalisering-shared-backend';
import {
  FormsApiTranslationMap,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../../../../config/config';
import { applicationPdfService, applicationService, formService, translationService } from '../../../../services';
import { mapToReceiptSummary } from '../../../../services/nologin/receiptMapper';
import { base64Decode } from '../../../../utils/base64';
import { assembleSubmitApplicationRequest } from '../../helpers/applicationUtils';
import { isResponseError, wrapResponseError } from '../../helpers/responseErrors';

export const generatePdfAndSubmit = async (
  applicationType: 'nologin' | 'digital',
  req: any,
  innsendingsId: string,
  accessToken: string,
) => {
  const { formPath, submission, language, submissionMethod } = req.body as {
    formPath: string;
    submission: Submission;
    language: TranslationLang;
    submissionMethod?: SubmissionMethod;
  };

  const form = await formService.getForm({
    formPath,
    select: ['skjemanummer', 'title', 'path', 'properties', 'components', 'revision'],
  });
  const translations: FormsApiTranslationMap = await translationService.getTranslations({
    formPath,
    languageCodes: [language],
  });
  const pdfAccessToken = req.headers.PdfAccessToken as string;
  const pdfFormData = renderApplicationPdf({
    form,
    submission,
    language,
    translations,
    submissionMethod,
    appConfig: { config: { gitVersion: config.gitVersion } },
  });
  const applicationPdfBase64 = await applicationPdfService.createPdf({
    accessToken: pdfAccessToken,
    pdfFormData,
  });
  const applicationPdf = base64Decode(applicationPdfBase64);
  if (!applicationPdf) {
    throw new Error('Generering av søknads PDF feilet');
  }

  const translate = translationUtil.createTranslate(translations, language);
  const submitRequest = assembleSubmitApplicationRequest(
    innsendingsId,
    form,
    submission,
    language,
    Array.from(applicationPdf),
    translate,
  );
  let submitResponse;
  try {
    submitResponse = await applicationService.submitApplication({
      accessToken,
      body: submitRequest,
      innsendingsId,
      type: applicationType,
    });
  } catch (error) {
    if (isResponseError(error)) {
      throw wrapResponseError({
        error,
        message: 'Application submit failed',
        userMessage: error.errorCode === 'SERVICE_UNAVAILABLE' ? error.userMessage : 'Feil ved innsending av søknad',
      });
    }
    throw error;
  }

  return {
    pdfBase64: Buffer.from(applicationPdf).toString('base64'),
    receipt: mapToReceiptSummary(submitResponse),
  };
};
