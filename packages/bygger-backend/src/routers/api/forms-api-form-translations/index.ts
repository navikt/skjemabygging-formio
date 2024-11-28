import { Router } from 'express';
import formTranslations from './form-translations';

const formsApiFormTranslationsRouter = Router();

formsApiFormTranslationsRouter.get('/:formPath', formTranslations.get);
formsApiFormTranslationsRouter.post('/:formPath', formTranslations.post);
formsApiFormTranslationsRouter.put('/:formPath/:id', formTranslations.put);

export default formsApiFormTranslationsRouter;
