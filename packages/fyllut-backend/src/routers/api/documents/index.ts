import express from 'express';
import { initApiConfig } from '../api-helper';
import documents from './documents';

const documentsRouter = express.Router();
const { azureSkjemabyggingProxy } = initApiConfig();

documentsRouter.post('/application', azureSkjemabyggingProxy, documents.application);
documentsRouter.post('/front-page-and-application', azureSkjemabyggingProxy, documents.coverPageAndApplication);

export default documentsRouter;
