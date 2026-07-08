import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { translationsService } from '../../services';

const globalTranslations = {
  get: async (req, res) =>
    res.json(await translationsService.loadGlobalTranslations(requestUtil.getStringParam(req, 'languageCode')!)),
};

export default globalTranslations;
