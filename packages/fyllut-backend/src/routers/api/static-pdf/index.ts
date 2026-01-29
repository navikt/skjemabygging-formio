import { Router } from 'express';
import staticPdf from './staticPdf';

const formsApiStaticPdfRouter = Router({ mergeParams: true });

formsApiStaticPdfRouter.get('/', staticPdf.getAll);
formsApiStaticPdfRouter.get('/:languageCode', staticPdf.downloadPdf);

export default formsApiStaticPdfRouter;
