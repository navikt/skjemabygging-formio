import {
  I18nTranslationMap,
  NavFormType,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
} from '@navikt/skjemadigitalisering-shared-domain';
import { applicationService } from '../../../../services';
import { LogMetadata } from '../../../../types/log';
import { getTranslationsForForm } from '../../../../utils/translations';

export const generatePdfAndSubmit = async (
  applicationType: 'nologin' | 'digital',
  req: any,
  innsendingsId: string,
  accessToken: string,
) => {
  const { form, submission, language, submissionMethod } = req.body as {
    form: NavFormType;
    submission: Submission;
    language: string;
    submissionMethod?: SubmissionMethod;
  };
  const translation: I18nTranslationMap = await getTranslationsForForm(form?.path ?? req.body.formPath, language);
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
    translation,
    language,
    submissionMethod,
    logMeta,
    applicationType,
  );
  const pdfBase64 = Buffer.from(pdf).toString('base64');
  return { pdfBase64, receipt };
};
