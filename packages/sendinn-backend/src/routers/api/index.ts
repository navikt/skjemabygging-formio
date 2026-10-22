import { createFrontendLogHandler, rateLimiter } from '@navikt/skjemadigitalisering-shared-backend';
import express from 'express';
import { logger } from '../../logger';
import config from './config';
import globalTranslations from './global-translations';

const apiRouter = express.Router();

apiRouter.get('/config', config.get);
apiRouter.get('/global-translations/:lang', globalTranslations.get);

// Same limit as fyllut's frontend log endpoint
apiRouter.post('/log/:level', rateLimiter(60 * 1000, 60), createFrontendLogHandler(logger));

export default apiRouter;
