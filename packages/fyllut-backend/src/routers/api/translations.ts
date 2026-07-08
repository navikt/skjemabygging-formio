import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { translationsService } from '../../services';

const translations = {
  get: async (req, res) =>
    res.json(await translationsService.loadTranslation(requestUtil.getStringParam(req, 'form')!)),
};

export default translations;
