import { errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import { entraIdM2mHandler, entraIdOboHandler } from '../../middleware/entraIdHandlers';
import formSpecRouter from './formSpecRouter';

const apiRouter = express.Router();

apiRouter.use('/forms', entraIdM2mHandler, formSpecRouter);
apiRouter.use('/employee/forms', entraIdOboHandler, formSpecRouter);
apiRouter.use(errorHandler);

export default apiRouter;
