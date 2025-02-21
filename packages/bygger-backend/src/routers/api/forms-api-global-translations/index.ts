import { Router } from 'express';
import globalTranslations from './global-translations';

const formsApiGlobalTranslationsRouter = Router();

formsApiGlobalTranslationsRouter.get('/', globalTranslations.get);
formsApiGlobalTranslationsRouter.post('/', globalTranslations.post);
formsApiGlobalTranslationsRouter.post('/publish', globalTranslations.publish);
formsApiGlobalTranslationsRouter.put('/:id', globalTranslations.put);
formsApiGlobalTranslationsRouter.delete('/:id', globalTranslations.delete);

export default formsApiGlobalTranslationsRouter;
