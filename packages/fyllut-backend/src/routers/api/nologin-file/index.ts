import express from 'express';
import { initApiConfig } from '../api-helper';
import { uploadSingleFile } from '../helpers/upload';
import nologinFile from './nologin-file';

const nologinFileRouter = express.Router();

const { azureM2MSendInn } = initApiConfig();

nologinFileRouter.post('/', azureM2MSendInn, uploadSingleFile('filinnhold'), nologinFile.post);
nologinFileRouter.delete('/', azureM2MSendInn, nologinFile.delete);
nologinFileRouter.delete('/*fileId', azureM2MSendInn, nologinFile.delete);

export default nologinFileRouter;
