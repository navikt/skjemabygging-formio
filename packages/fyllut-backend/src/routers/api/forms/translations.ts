import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { Request, Response } from 'express';
import { translationService } from '../../../services';

const translations = {
  get: async (req: Request, res: Response) => {
    const formPath = requestUtil.getStringParam(req, 'formPath')!;
    res.json(await translationService.getTranslations({ formPath }));
  },
};

export default translations;
