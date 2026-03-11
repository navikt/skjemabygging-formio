import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../../../../utils/errors/HttpError';
import { validateNologinContext } from '../../../nologin-file/nologin-file';
import { generatePdfAndSubmit } from '../common';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noLoginContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = noLoginContext.innsendingsId;
    const accessToken = req.headers.AzureAccessToken as string;

    const receiptAndPdf = await generatePdfAndSubmit('nologin', req, innsendingsId, accessToken);
    res.json(receiptAndPdf);
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

export default {
  post,
};
