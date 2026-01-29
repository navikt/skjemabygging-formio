import {
  I18nTranslationMap,
  NavFormType,
  ReceiptSummary,
  Submission,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { noLoginFileService } from '../../../../services';
import { LogMetadata } from '../../../../types/log';
import { HttpError } from '../../../../utils/errors/HttpError';

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

    const { pdf, receipt }: { pdf: Uint8Array; receipt: ReceiptSummary } = await noLoginFileService.submit(
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
    if (error instanceof HttpError && error.http_response_body.errorCode === 'temporarilyUnavailable') {
      return res.status(503).json({
        message: TEXTS.statiske.nologin.temporarilyUnavailable,
        errorCode: 'SERVICE_UNAVAILABLE',
      });
    }
    next(error);
  }
};

export default { post };
