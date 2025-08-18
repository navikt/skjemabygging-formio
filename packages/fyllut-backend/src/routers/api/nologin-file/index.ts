import express from 'express';
import multer from 'multer';
import { config } from '../../../config/config';
import { rateLimiter } from '../../../middleware/ratelimit';
import { initApiConfig } from '../api-helper';
import nologinFile from './nologin-file';

const RATE_LIMIT = config.isTest ? 1000 : 20; // Allow more requests in test environment

const upload = multer();
const nologinFileRouter = express.Router();

const { azureM2MSendInn } = initApiConfig();
const rateLimitHandler = rateLimiter(60000, RATE_LIMIT);

nologinFileRouter.post('/', azureM2MSendInn, rateLimitHandler, upload.single('filinnhold'), nologinFile.post);
nologinFileRouter.delete('/', azureM2MSendInn, nologinFile.delete);
nologinFileRouter.delete('/*fileId', azureM2MSendInn, nologinFile.delete);

export default nologinFileRouter;
