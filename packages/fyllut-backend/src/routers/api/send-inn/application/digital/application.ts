import { NextFunction, Request, Response } from 'express';
import { generatePdfAndSubmit } from '../common';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { innsendingsId } = req.params;
    const accessToken = req.getTokenxAccessToken();

    const receiptAndPdf = await generatePdfAndSubmit('digital', req, innsendingsId, accessToken);
    res.json(receiptAndPdf);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
};
