import { Language } from '@navikt/skjemadigitalisering-shared-domain';
import express, { NextFunction, Request, Response } from 'express';
import config from '../../../config';
import { copyService } from '../../../services';

const globalTranslationsRouter = express.Router();

globalTranslationsRouter.put('/:language/copy-from-prod', async (req: Request, res: Response, next: NextFunction) => {
  if (config.naisClusterName === 'prod-gcp' || !copyService) {
    return res.sendStatus(405);
  }
  try {
    const { language } = req.params;
    const formioToken = req.getFormioToken?.();
    await copyService.globalTranslations(language as Language, formioToken);
    return res.sendStatus(201);
  } catch (error) {
    next(error);
  }
});

export default globalTranslationsRouter;
