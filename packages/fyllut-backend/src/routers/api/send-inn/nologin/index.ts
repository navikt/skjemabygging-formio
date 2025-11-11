import { I18nTranslationMap, NavFormType, Receipt, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { noLoginFileService } from '../../../../services';
import { LogMetadata } from '../../../../types/log';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nologinContext = req.getNologinContext();
    if (!nologinContext) {
      next(new Error('NologinContext is missing'));
      return;
    }
    const { form, submission, language, translation, pdfFormData } = req.body as {
      form: NavFormType;
      submission: Submission;
      language: string;
      translation: I18nTranslationMap;
      pdfFormData: any; // TODO Bruk PdfFormData når den er flyttet til shared-domain
    };
    const accessToken = req.headers.AzureAccessToken as string;
    const pdfAccessToken = req.headers.PdfAccessToken as string;
    const innsendingsId = nologinContext.innsendingsId;
    const logMeta: LogMetadata = {
      innsendingsId,
      skjemanummer: form?.properties?.skjemanummer,
      language,
      fyllutRequestPath: req.path,
    };

    const { pdf, receipt }: { pdf: Uint8Array; receipt: Receipt } = await noLoginFileService.submit(
      pdfAccessToken,
      accessToken,
      innsendingsId,
      form,
      submission,
      translation,
      language,
      pdfFormData,
      logMeta,
    );
    const pdfBase64 = Buffer.from(pdf).toString('base64');
    res.json({ pdfBase64, receipt });
  } catch (error) {
    next(error);
  }
};

export default { post };
