import { Router } from 'express';
import multer from 'multer';
import authHandlers from '../helpers/authHandlers';
import staticPdf from './staticPdf';

const upload = multer();
const formsApiStaticPdfRouter = Router({ mergeParams: true });
const { formsApiAuthHandler } = authHandlers;

formsApiStaticPdfRouter.get('/', staticPdf.getAll);
formsApiStaticPdfRouter.get('/:languageCode', staticPdf.downloadPdf);
formsApiStaticPdfRouter.post('/:languageCode', formsApiAuthHandler, upload.single('fileContent'), staticPdf.uploadPdf);
formsApiStaticPdfRouter.delete('/:languageCode', formsApiAuthHandler, staticPdf.deletePdf);

export default formsApiStaticPdfRouter;
