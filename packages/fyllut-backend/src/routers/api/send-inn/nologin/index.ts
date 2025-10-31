import { I18nTranslationMap, NavFormType, Receipt, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { noLoginFileService } from '../../../../services';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nologinContext = req.getNologinContext();
    if (!nologinContext) {
      next(new Error('NologinContext is missing'));
      return;
    }
    const { form, submission, language, translation } = req.body as {
      form: NavFormType;
      submission: Submission;
      language: string;
      translation: I18nTranslationMap;
    };
    const accessToken = req.headers.AzureAccessToken as string;
    const pdfAccessToken = req.headers.PdfAccessToken as string;

    const { pdf, receipt }: { pdf: Uint8Array; receipt: Receipt } = await noLoginFileService.submit(
      pdfAccessToken,
      accessToken,
      nologinContext.innsendingsId,
      form,
      submission,
      'digitalnologin',
      translation,
      language,
    );
    const pdfBase64 = Buffer.from(pdf).toString('base64');
    res.json({ pdfBase64, receipt });
  } catch (error) {
    next(error);
  }
};

export default { post };
