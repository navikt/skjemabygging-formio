import { Router } from 'express';
import formTranslations from './form-translations';

const formsApiFormTranslationsRouter = Router({ mergeParams: true });

formsApiFormTranslationsRouter.get('/', formTranslations.get);
formsApiFormTranslationsRouter.post('/', formTranslations.post);
formsApiFormTranslationsRouter.put('/:id', formTranslations.put);

export default formsApiFormTranslationsRouter;
