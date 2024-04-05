import express from 'express';
import authorizedPublisher from '../helpers/authorizedPublisher';
import form from './form';
import forms from './forms';

const formsRouter = express.Router();

formsRouter.get('/', forms.get);
formsRouter.get('/:formPath', form.get);
formsRouter.put('/:formPath', authorizedPublisher, form.put);
formsRouter.put('/:formPath/overwrite-with-prod', authorizedPublisher, form.copyFromProd);

export default formsRouter;
