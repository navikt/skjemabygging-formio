import express from 'express';
import form from './form';

const formsRouter = express.Router();

formsRouter.get('/:formPath', form.get);

export default formsRouter;
