import { NavFormType, ReceiptSummary, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { applicationService } from '../../../../services';
import { LogMetadata } from '../../../../types/log';

export const generatePdfAndSubmit = async (
  applicationType: 'nologin' | 'digital',
  req: any,
  innsendingsId: string,
  accessToken: string,
) => {
  const { form, submission, language } = req.body as {
    form: NavFormType;
    submission: Submission;
    language: string;
  };
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
    language,
    logMeta,
    applicationType,
  );
  const pdfBase64 = Buffer.from(pdf).toString('base64');
  return { pdfBase64, receipt };
};
