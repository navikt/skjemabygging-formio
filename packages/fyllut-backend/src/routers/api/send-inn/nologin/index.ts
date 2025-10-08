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
    const { form, submission, language, translation } = req.body as {
      form: NavFormType;
      submission: Submission;
      language: string;
      translation: I18nTranslationMap;
    };
    const accessToken = req.headers.AzureAccessToken as string;
    const pdfAccessToken = req.headers.PdfAccessToken as string;

    const result = await noLoginFileService.submit(
      pdfAccessToken,
      accessToken,
      nologinContext.innsendingsId,
      form,
      submission,
      'digitalnologin',
      translation,
      language,
    );
    const fileName = `${form.path}.pdf`;
    res.contentType('application/json; charset=UTF-8');
    res.send({
      innsendingId: result.innsendingId,
      fileName,
      pdf: Buffer.from(result.pdf).toString('base64'),
      kvittering: result.kvittering,
    });
  } catch (error) {
    next(error);
  }
};

export default { post };
