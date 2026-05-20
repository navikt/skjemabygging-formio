import {
  FormsApiTranslationMap,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { applicationService, sharedFormService, translationService } from '../../../../services';
import { LogMetadata } from '../../../../types/log';

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

  const form = await sharedFormService.getForm({
    formPath,
    select: ['skjemanummer', 'title', 'path', 'properties', 'components', 'revision'],
  });
  const translations: FormsApiTranslationMap = await translationService.getTranslations({ formPath });
  const pdfAccessToken = req.headers.PdfAccessToken as string;
  const logMeta: LogMetadata = {
    innsendingsId,
    skjemanummer: form?.properties?.skjemanummer,
    language,
    fyllutRequestPath: req.path,
  };

  const { pdf, receipt }: { pdf: Uint8Array; receipt: ReceiptSummary } = await applicationService.submit(
    pdfAccessToken,
    accessToken,
    innsendingsId,
    form,
    submission,
    translations,
    language,
    submissionMethod,
    logMeta,
    applicationType,
  );
  const pdfBase64 = Buffer.from(pdf).toString('base64');
  return { pdfBase64, receipt };
};
