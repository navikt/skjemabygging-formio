import express from 'express';
import { initApiConfig } from '../api-helper';
import documents from './documents';

const documentsRouter = express.Router();
const { azureSkjemabyggingProxy, azurePdfGeneratorToken, azureMergePdfToken } = initApiConfig();

documentsRouter.post('/application', azurePdfGeneratorToken, azurePdfGeneratorToken, documents.application);
documentsRouter.post(
  '/cover-page-and-application',
  azureSkjemabyggingProxy,
  azurePdfGeneratorToken,
  azureMergePdfToken,
  documents.coverPageAndApplication,
);

export default documentsRouter;
