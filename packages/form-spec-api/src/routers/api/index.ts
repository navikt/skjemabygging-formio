import { errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import entraIdHandler from '../../middleware/entraIdHandler';
import formSpecRouter from './formSpecRouter';

const apiRouter = express.Router();

apiRouter.use(entraIdHandler);
apiRouter.use('/forms', formSpecRouter);
apiRouter.use(errorHandler);

export default apiRouter;
