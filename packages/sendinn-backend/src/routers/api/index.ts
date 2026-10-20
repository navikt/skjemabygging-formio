import {
  createFrontendLogHandler,
  createSharedFrontendConfig,
  rateLimiter,
  requestUtil,
} from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import express from 'express';
import { config } from '../../config';
import { isSupportedLanguage } from '../../language';
import { logger } from '../../logger';
import { publishedTranslationService } from '../../services';

const frontendConfig = createSharedFrontendConfig({
  naisClusterName: config.naisClusterName,
  featureToggles: {},
  loggerConfig: { enabled: true, logLevel: 'info', browserOnly: config.isDevelopment },
  isDevelopment: config.isDevelopment,
});

const apiRouter = express.Router();

apiRouter.get('/config', (_req, res) => {
  res.json(frontendConfig);
});

apiRouter.get('/global-translations/:lang', async (req, res) => {
  const language = requestUtil.getStringParam(req, 'lang')!;
  if (!isSupportedLanguage(language)) {
    throw new ResponseError('BAD_REQUEST', `Unsupported language: ${language}`);
  }
  res.json(await publishedTranslationService.getGlobalTranslations(language));
});

// Same limit as fyllut's frontend log endpoint
apiRouter.post('/log/:level', rateLimiter(60 * 1000, 60), createFrontendLogHandler(logger));

export default apiRouter;
