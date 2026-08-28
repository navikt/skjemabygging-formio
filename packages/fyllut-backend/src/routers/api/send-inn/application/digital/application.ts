import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { getIdportenPid, getTokenxAccessToken } from '../../../../../security/tokenHelper';
import { generatePdfAndSubmit } from '../common';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
    const accessToken = getTokenxAccessToken(req);
    const authenticatedIdentityNumber = getIdportenPid(req);

    const receiptAndPdf = await generatePdfAndSubmit(
      { applicationType: 'digital', authenticatedIdentityNumber },
      req,
      innsendingsId,
      accessToken,
    );
    res.json(receiptAndPdf);
  } catch (error) {
    next(error);
  }
};

export default {
  post,
};
