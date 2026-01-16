import express from 'express';
import formsApiFormTranslationsRouter from '../forms-api-form-translations';
import authHandlers from '../helpers/authHandlers';
import formsApiStaticPdfRouter from '../static-pdf';
import forms from './forms';

const formsRouter = express.Router();
const { formsApiAuthHandler } = authHandlers;

formsRouter.get('/', forms.getAll);
formsRouter.get('/:formPath', forms.get);
formsRouter.delete('/:formPath', formsApiAuthHandler, forms.deleteForm);
formsRouter.post('/', formsApiAuthHandler, forms.post);
formsRouter.put('/:formPath', formsApiAuthHandler, forms.put);
formsRouter.delete('/:formPath/reset', formsApiAuthHandler, forms.resetForm);
formsRouter.post('/:formPath/lock', formsApiAuthHandler, forms.postLockForm);
formsRouter.delete('/:formPath/lock', formsApiAuthHandler, forms.deleteLockForm);
formsRouter.use('/:formPath/translations', formsApiAuthHandler, formsApiFormTranslationsRouter);
formsRouter.use('/:formPath/static-pdfs', formsApiAuthHandler, formsApiStaticPdfRouter);

export default formsRouter;
