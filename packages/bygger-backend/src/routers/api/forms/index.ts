import express from 'express';
import formsApiFormTranslationsRouter from '../forms-api-form-translations';
import authHandlers from '../helpers/authHandlers';
import forms from './forms';

const formsRouter = express.Router();
const { formsApiAuthHandler } = authHandlers;

formsRouter.get('/', forms.getAll);
formsRouter.get('/:formPath', forms.get);
formsRouter.post('/', formsApiAuthHandler, forms.post);
formsRouter.put('/:formPath', formsApiAuthHandler, forms.put);
formsRouter.use('/:formPath/translations', formsApiAuthHandler, formsApiFormTranslationsRouter);

export default formsRouter;
