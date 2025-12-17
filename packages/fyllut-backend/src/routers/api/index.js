import express from 'express';
import { config as appConfig } from '../../config/config';
import { NaisCluster } from '../../config/nais-cluster.js';
import envQualifier from '../../middleware/envQualifier';
import { rateLimiter } from '../../middleware/ratelimit';
import tryCatch from '../../middleware/tryCatch';
import idportenAuthHandler from '../../security/idportenAuthHandler';
import activeTasks from './active-tasks';
import { initApiConfig } from './api-helper';
import captchaRouter from './captcha';
import commonCodes from './common-codes';
import config from './config';
import documentsRouter from './documents';
import enhetsliste from './enhetsliste.js';
import form from './form';
import forms from './forms';
import forsteside from './forsteside';
import globalTranslations from './global-translations.js';
import log from './log';
import nologinFileRouter from './nologin-file';
import pdl from './pdl';
import recipients from './recipients';
import registerDataRouter from './register-data/register-data';
import sendInnSoknad from './send-inn-soknad';
import sendInnUtfyltSoknad from './send-inn-utfylt-soknad';
import activities from './send-inn/activities/send-inn-activities';
import nologin from './send-inn/nologin';
import prefillData from './send-inn/prefill-data/send-inn-prefill-data';
import status from './status';
import translations from './translations.js';

const apiRouter = express.Router();

const { featureToggles, naisClusterName } = appConfig;
const {
  azureM2MSkjemabyggingProxy,
  azureM2MPdl,
  azureM2MSendInn,
  kodeverkToken,
  tokenxPdl,
  tokenxSendInn,
  azurePdfGeneratorToken,
  nologinTokenHandler,
} = initApiConfig();

apiRouter.all('*path', rateLimiter(60000, 1000), idportenAuthHandler, envQualifier);
apiRouter.use('/captcha', captchaRouter);
apiRouter.get('/config', config.get);
apiRouter.get('/enhetsliste', enhetsliste.get);
apiRouter.get('/forms', tryCatch(forms.get));
apiRouter.get('/forms/:formPath', tryCatch(form.get));
apiRouter.post('/foersteside', azureM2MSkjemabyggingProxy, forsteside.post);
apiRouter.use('/documents', documentsRouter);
apiRouter.get('/global-translations/:languageCode', tryCatch(globalTranslations.get));
apiRouter.get('/translations/:form', tryCatch(translations.get));
apiRouter.get('/recipients', tryCatch(recipients.get));
apiRouter.get('/send-inn/aktive-opprettede-soknader/:skjemanummer', tokenxSendInn, tryCatch(activeTasks.get));
apiRouter.get('/send-inn/soknad/:innsendingsId', tokenxSendInn, sendInnSoknad.get);
apiRouter.delete('/send-inn/soknad/:innsendingsId', tokenxSendInn, sendInnSoknad.delete);
apiRouter.post('/send-inn/soknad', tokenxSendInn, sendInnSoknad.post);
apiRouter.put('/send-inn/soknad', tokenxSendInn, sendInnSoknad.put);
apiRouter.put('/send-inn/utfyltsoknad', azurePdfGeneratorToken, tokenxSendInn, sendInnUtfyltSoknad.put);
apiRouter.get('/common-codes/archive-subjects', kodeverkToken, commonCodes.getArchiveSubjects);
apiRouter.get('/common-codes/currencies', kodeverkToken, commonCodes.getCurrencies);
apiRouter.get('/common-codes/enhetstyper', kodeverkToken, commonCodes.getEnhetstyper);
apiRouter.get('/common-codes/area-codes', kodeverkToken, commonCodes.getAreaCodes);
apiRouter.post('/log/:level', rateLimiter(60000, 60), log.post);
apiRouter.get('/health/status', status.get);
apiRouter.get('/send-inn/prefill-data', tokenxSendInn, prefillData.get);
apiRouter.get('/send-inn/activities', tokenxSendInn, activities.get);
apiRouter.use('/register-data', registerDataRouter);

// Not available in production yet
if (naisClusterName !== NaisCluster.PROD) {
  const rateLimitHandler = rateLimiter(60000, appConfig.isTest ? 1000 : 40);
  apiRouter.use('/nologin-file', rateLimitHandler, nologinTokenHandler, nologinFileRouter);
  apiRouter.post(
    '/send-inn/nologin-soknad',
    rateLimitHandler,
    nologinTokenHandler,
    azureM2MSendInn,
    azurePdfGeneratorToken,
    nologin.post,
  );
}

if (featureToggles.enablePdl) {
  apiRouter.get('/pdl/person/:id', tokenxPdl, pdl.person);
  apiRouter.get('/pdl/children/:id', azureM2MPdl, pdl.children);
}

export default apiRouter;
