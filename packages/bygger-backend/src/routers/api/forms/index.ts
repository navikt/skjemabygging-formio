import express from 'express';
import formsApiFormTranslationsRouter from '../forms-api-form-translations';
import authHandlers from '../helpers/authHandlers';
import form from './form';
import forms from './forms';

const formsRouter = express.Router();
const { authorizedPublisher, formsApiAuthHandler } = authHandlers;

formsRouter.get('/', forms.get);
formsRouter.get('/:formPath', form.get);
formsRouter.put('/:formPath', authorizedPublisher, form.put);
formsRouter.put('/:formPath/overwrite-with-prod', authorizedPublisher, form.copyFromProd);
formsRouter.put('/:formPath/form-settings', authorizedPublisher, form.putFormSettings);
formsRouter.use('/:formPath/translations', formsApiAuthHandler, formsApiFormTranslationsRouter);

export default formsRouter;
