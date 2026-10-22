import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { isSupportedLanguage } from '../../language';
import { publishedTranslationService } from '../../services';

const globalTranslations = {
  get: async (req: Request, res: Response) => {
    const language = requestUtil.getStringParam(req, 'lang')!;
    if (!isSupportedLanguage(language)) {
      throw new ResponseError('BAD_REQUEST', `Unsupported language: ${language}`);
    }
    res.json(await publishedTranslationService.getGlobalTranslations(language));
  },
};

export default globalTranslations;
