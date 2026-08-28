import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { generatePdfAndSubmit } from '../common';
import { validateNologinContext } from './context';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noLoginContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = noLoginContext.innsendingsId;
    const accessToken = requestUtil.getAzureAccessToken(req);

    const receiptAndPdf = await generatePdfAndSubmit({ applicationType: 'nologin' }, req, innsendingsId, accessToken);
    res.json(receiptAndPdf);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
};
