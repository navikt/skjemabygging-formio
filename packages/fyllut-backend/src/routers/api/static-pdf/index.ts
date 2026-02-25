import { errorHandler, paramValidation } from '@navikt/skjemadigitalisering-shared-backend';
import { Router } from 'express';
import { initApiConfig } from '../api-helper';
import staticPdf from './staticPdf';

const formsApiStaticPdfRouter = Router({ mergeParams: true });
const { azureM2MSkjemabyggingProxy, azureMergePdfToken } = initApiConfig();

formsApiStaticPdfRouter.param('languageCode', paramValidation.languageCode);

formsApiStaticPdfRouter.get('/', staticPdf.getAll);
formsApiStaticPdfRouter.post('/:languageCode', azureM2MSkjemabyggingProxy, azureMergePdfToken, staticPdf.downloadPdf);

formsApiStaticPdfRouter.use(errorHandler);

export default formsApiStaticPdfRouter;
