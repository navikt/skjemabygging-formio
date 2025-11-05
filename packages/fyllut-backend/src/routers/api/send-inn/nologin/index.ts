import { I18nTranslationMap, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { noLoginFileService } from '../../../../services';

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

    const result = await noLoginFileService.submit(
      pdfAccessToken,
      accessToken,
      nologinContext.innsendingsId,
      form,
      submission,
      translation,
      language,
      pdfFormData,
    );
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${form.path}.pdf`)}`);
    res.send(Buffer.from(result.pdf));
  } catch (error) {
    next(error);
  }
};

export default { post };
