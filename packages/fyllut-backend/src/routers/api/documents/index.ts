import express from 'express';
import { initApiConfig } from '../api-helper';
import documents from './documents';

const documentsRouter = express.Router();
const { azureSkjemabyggingProxy, azurePdfGeneratorToken } = initApiConfig();

documentsRouter.post('/application', azurePdfGeneratorToken, azurePdfGeneratorToken, documents.application);
console.log(`azurePdfGeneratorToken: ${azurePdfGeneratorToken}`);
documentsRouter.post(
  '/cover-page-and-application',
  azureSkjemabyggingProxy,
  azurePdfGeneratorToken,
  documents.coverPageAndApplication,
);

export default documentsRouter;
