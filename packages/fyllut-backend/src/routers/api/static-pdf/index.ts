import { errorHandler, paramValidation } from '@navikt/skjemadigitalisering-shared-backend';
import { Router } from 'express';
import staticPdf from './staticPdf';

const formsApiStaticPdfRouter = Router({ mergeParams: true });

formsApiStaticPdfRouter.param('languageCode', paramValidation.languageCode);

formsApiStaticPdfRouter.get('/', staticPdf.getAll);
formsApiStaticPdfRouter.get('/:languageCode', staticPdf.downloadPdf);

formsApiStaticPdfRouter.use(errorHandler);

export default formsApiStaticPdfRouter;
