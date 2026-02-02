import { paramValidation } from '@navikt/skjemadigitalisering-shared-backend';
import { Router } from 'express';
import staticPdf from './staticPdf';

const formsApiStaticPdfRouter = Router({ mergeParams: true });

formsApiStaticPdfRouter.param('languageCode', paramValidation.languageCode);

formsApiStaticPdfRouter.get('/', staticPdf.getAll);
formsApiStaticPdfRouter.get('/:languageCode', staticPdf.downloadPdf);

export default formsApiStaticPdfRouter;
