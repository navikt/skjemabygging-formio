import express from 'express';
import formsApiFormTranslationsRouter from '../forms-api-form-translations';
import authHandlers from '../helpers/authHandlers';
import forms from './forms';
import old_form from './old_form';

const formsRouter = express.Router();
const { authorizedPublisher, formsApiAuthHandler } = authHandlers;

formsRouter.put('/:formPath/overwrite-with-prod', authorizedPublisher, old_form.copyFromProd);
formsRouter.put('/:formPath/form-settings', authorizedPublisher, old_form.putFormSettings);

formsRouter.get('/', forms.getAll);
formsRouter.get('/:formPath', forms.get);
formsRouter.post('/', formsApiAuthHandler, forms.post);
formsRouter.put('/:formPath', formsApiAuthHandler, forms.put);
formsRouter.use('/:formPath/translations', formsApiAuthHandler, formsApiFormTranslationsRouter);

export default formsRouter;
