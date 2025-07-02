import express from 'express';
import multer from 'multer';
import { initApiConfig } from '../api-helper';
import nologinFile from './nologin-file';

const upload = multer();
const nologinFileRouter = express.Router();

const { azureSendInn } = initApiConfig();

// @ts-expect-error RequestHandler returned by upload.single is not typed correctly in multer
nologinFileRouter.post('/', azureSendInn, upload.single('filinnhold'), nologinFile.post);

export default nologinFileRouter;
