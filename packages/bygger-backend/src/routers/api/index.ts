import express from 'express';
import { rateLimiter } from '../../middleware/ratelimit';
import config from './config';
import enhetsliste from './enhetsliste';
import formPublicationsRouter from './form-publications';
import formDiff from './formDiff';
import formsRouter from './forms';
import formsApiGlobalTranslationsRouter from './forms-api-global-translations';
import apiErrorHandler from './helpers/apiErrorHandler';
import authHandlers from './helpers/authHandlers';
import importRouter from './import';
import log from './log';
import migrate from './migrate';
import migratePreview from './migrate-preview';
import migrateUpdate from './migrate-update';
import publishedForms from './published-forms';
import recipientsRouter from './recipients';
import reportsRouter from './reports';
import temakoder from './temakoder';

const apiRouter = express.Router();
const { formsApiAuthHandler } = authHandlers;

apiRouter.get('/config', config);
apiRouter.get('/published-forms/:formPath', publishedForms.get);
apiRouter.get('/enhetsliste', enhetsliste);
apiRouter.get('/temakoder', temakoder);
apiRouter.use('/reports', reportsRouter);
apiRouter.get('/migrate', migrate);
apiRouter.get('/migrate/preview/:formPath', migratePreview);
apiRouter.post('/migrate/update', formsApiAuthHandler, migrateUpdate);
apiRouter.get('/form/:formPath/diff', formDiff);
apiRouter.use('/forms', formsRouter);
apiRouter.use('/form-publications', formPublicationsRouter);
apiRouter.use('/recipients', formsApiAuthHandler, recipientsRouter);
apiRouter.use('/translations', formsApiAuthHandler, formsApiGlobalTranslationsRouter);
apiRouter.use('/import', formsApiAuthHandler, importRouter);
apiRouter.post('/log/:level', rateLimiter(60000, 60), log);

apiRouter.use(apiErrorHandler);

export default apiRouter;
