import { createFrontendLogHandler, rateLimiter } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import { logger } from '../../logger';
import config from './config';
import { getForm } from './form';
import globalTranslations from './global-translations';
import { getNavUnits } from './nav-units';

const apiRouter = express.Router();

apiRouter.get('/config', config.get);
apiRouter.get('/forms/:formPath', getForm);
apiRouter.get('/nav-units', getNavUnits);
apiRouter.get('/global-translations/:lang', globalTranslations.get);
apiRouter.post('/log/:level', rateLimiter(60 * 1000, 60), createFrontendLogHandler(logger));

export default apiRouter;
