import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { applicationService } from '../../../../../services';
import { generatePdfAndSubmit } from '../common';
import { validateNologinContext } from './context';

const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noLoginContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = noLoginContext.innsendingsId;
    const accessToken = requestUtil.getAzureAccessToken(req);

    const receiptAndPdf = await generatePdfAndSubmit('nologin', req, innsendingsId, accessToken);
    res.json(receiptAndPdf);
  } catch (error) {
    next(error);
  }
};

const deleteNologinApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nologinContext = validateNologinContext(req.getNologinContext());
    const innsendingsId = nologinContext.innsendingsId;
    const accessToken = requestUtil.getAzureAccessToken(req);

    await applicationService.deleteNologinApplication({
      accessToken,
      innsendingsId,
      logMeta: {
        innsendingsId,
        route: req.originalUrl,
      },
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export default {
  delete: deleteNologinApplication,
  post,
};
