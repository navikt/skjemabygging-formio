import { translationsService } from '../../services';

const globalTranslations = {
  get: async (req, res) => res.json(await translationsService.loadGlobalTranslations(req.params.languageCode)),
};

export default globalTranslations;
