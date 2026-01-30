import express from 'express';
import tryCatch from '../../../middleware/tryCatch';
import formsApiStaticPdfRouter from '../static-pdf';
import form from './form';
import forms from './forms';

const formsApiRouter = express.Router();

formsApiRouter.get('/', tryCatch(forms.get));
formsApiRouter.get('/:formPath', tryCatch(form.get));

formsApiRouter.use('/:formPath/static-pdfs', formsApiStaticPdfRouter);

export default formsApiRouter;
