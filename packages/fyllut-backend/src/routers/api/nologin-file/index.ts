import express from 'express';
import multer from 'multer';
import { initApiConfig } from '../api-helper';
import nologinFile from './nologin-file';

const upload = multer();
const nologinFileRouter = express.Router();

const { azureSendInn } = initApiConfig();

nologinFileRouter.post('/', azureSendInn, upload.single('filinnhold'), nologinFile.post);
nologinFileRouter.delete('/', azureSendInn, nologinFile.delete);
nologinFileRouter.delete('/*filId', azureSendInn, nologinFile.delete);

export default nologinFileRouter;
