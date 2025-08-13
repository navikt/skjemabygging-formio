import express from 'express';
import multer from 'multer';
import { initApiConfig } from '../api-helper';
import nologinFile from './nologin-file';

const upload = multer();
const nologinFileRouter = express.Router();

const { azureM2MSendInn } = initApiConfig();

nologinFileRouter.post('/', azureM2MSendInn, upload.single('filinnhold'), nologinFile.post);
nologinFileRouter.delete('/', azureM2MSendInn, nologinFile.delete);
nologinFileRouter.delete('/*fileId', azureM2MSendInn, nologinFile.delete);

export default nologinFileRouter;
