import express from 'express';
import { initApiConfig } from '../api-helper';
import documents from './documents';

const documentsRouter = express.Router();
const { azureM2MSkjemabyggingProxy, azurePdfGeneratorToken, azureMergePdfToken } = initApiConfig();

documentsRouter.post('/application', azurePdfGeneratorToken, azurePdfGeneratorToken, documents.application);
documentsRouter.post(
  '/cover-page-and-application',
  azureM2MSkjemabyggingProxy,
  azurePdfGeneratorToken,
  azureMergePdfToken,
  documents.coverPageAndApplication,
);

export default documentsRouter;
