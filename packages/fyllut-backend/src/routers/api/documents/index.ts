import express from 'express';
import { initApiConfig } from '../api-helper';
import documents from './documents';

const documentsRouter = express.Router();
const { azureSkjemabyggingProxy } = initApiConfig();

documentsRouter.post('/front-page', azureSkjemabyggingProxy, documents.frontPage);
documentsRouter.post('/front-page-and-application', azureSkjemabyggingProxy, documents.frontPageAndApplication);

export default documentsRouter;
