import { createFrontendLogHandler, rateLimiter } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import { logger } from '../../logger';
import config from './config';
import { getForm } from './form';
import globalTranslations from './global-translations';

const apiRouter = express.Router();

apiRouter.get('/config', config.get);
apiRouter.get('/forms/:formPath', getForm);
apiRouter.get('/global-translations/:lang', globalTranslations.get);
apiRouter.post('/log/:level', rateLimiter(60 * 1000, 60), createFrontendLogHandler(logger));

export default apiRouter;
