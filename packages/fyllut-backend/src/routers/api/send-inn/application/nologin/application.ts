import { NextFunction, Request, Response } from 'express';
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
    next(error);
  }
};

export default {
  post,
};
