import { Router } from 'express';
import globalTranslations from './global-translations';

const formsApiGlobalTranslationsRouter = Router();

formsApiGlobalTranslationsRouter.get('/', globalTranslations.get);
formsApiGlobalTranslationsRouter.post('/', globalTranslations.post);
formsApiGlobalTranslationsRouter.put('/:id', globalTranslations.put);

export default formsApiGlobalTranslationsRouter;
