import {
  createFrontendLogHandler,
  createSharedFrontendConfig,
  requestUtil,
} from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import express from 'express';
import { config } from '../../config';
import { logger } from '../../logger';
import { publishedTranslationService } from '../../services';

const supportedLanguages: TranslationLang[] = ['nb', 'nn', 'en'];

const isSupportedLanguage = (language: string): language is TranslationLang =>
  supportedLanguages.includes(language as TranslationLang);

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

apiRouter.post('/log/:level', createFrontendLogHandler(logger));

export default apiRouter;
