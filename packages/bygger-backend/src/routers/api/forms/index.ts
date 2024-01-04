import express from 'express';
import authorizedPublisher from '../helpers/authorizedPublisher';
import form from './form';

const formsRouter = express.Router();

formsRouter.get('/:formPath', form.get);
formsRouter.put('/:formPath', authorizedPublisher, form.put);

export default formsRouter;
