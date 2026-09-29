import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { applicationService } from '../../../../../services';
import { generatePdfAndSubmit } from '../common';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
    const accessToken = req.getTokenxAccessToken();

    const receiptAndPdf = await generatePdfAndSubmit('digital', req, innsendingsId, accessToken);
    res.json(receiptAndPdf);
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const innsendingsId = requestUtil.getStringParam(req, 'innsendingsId')!;
    const accessToken = req.getTokenxAccessToken();

    await applicationService.deleteApplication({
      accessToken,
      innsendingsId,
      logMeta: {
        innsendingsId,
        route: req.originalUrl,
      },
      type: 'digital',
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  delete: deleteApplication,
  post,
};
