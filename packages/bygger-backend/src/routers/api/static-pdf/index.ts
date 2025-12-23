import { Router } from 'express';
import multer from 'multer';
import staticPdf from './staticPdf';

const upload = multer();
const formsApiStaticPdfRouter = Router({ mergeParams: true });

formsApiStaticPdfRouter.get('/', staticPdf.getAll);
formsApiStaticPdfRouter.post('/:languageCode', upload.single('fileContent'), staticPdf.uploadPdf);
formsApiStaticPdfRouter.get('/:languageCode', staticPdf.downloadPdf);
formsApiStaticPdfRouter.delete('/:languageCode', staticPdf.deletePdf);

export default formsApiStaticPdfRouter;
