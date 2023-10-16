import { translationsService } from '../../services';

const translations = {
  get: async (req, res) => res.json(await translationsService.loadTranslation(req.params.form)),
};

export default translations;
