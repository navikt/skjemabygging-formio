import express from 'express';
import { config as appConfig } from '../../config/config';
import { rateLimiter } from '../../middleware/ratelimit';
import traceWrapper from '../../middleware/traceWrapper';
import tryCatch from '../../middleware/tryCatch';
import idportenAuthHandler from '../../security/idportenAuthHandler';
import activeTasks from './active-tasks';
import { initApiConfig } from './api-helper';
import commonCodes from './common-codes';
import config from './config';
import countries from './countries.js';
import enhetsliste from './enhetsliste.js';
import exstream from './exstream';
import form from './form';
import forms from './forms';
import forsteside from './forsteside';
import globalTranslations from './global-translations.js';
import log from './log';
import mottaksadresser from './mottaksadresser.js';
import pdl from './pdl';
import sendInnSoknad from './send-inn-soknad';
import sendInnUtfyltSoknad from './send-inn-utfylt-soknad';
import activities from './send-inn/activities/send-inn-activities';
import prefillData from './send-inn/prefill-data/send-inn-prefill-data';
import status from './status';
import translations from './translations.js';

const apiRouter = express.Router();

const { featureToggles } = appConfig;
const { azureSkjemabyggingProxy, azurePdl, tokenxPdl, tokenxSendInn } = initApiConfig();

apiRouter.all('*', traceWrapper('idporten.auth', idportenAuthHandler));
apiRouter.get('/config', config.get);
apiRouter.get('/countries', countries.get);
apiRouter.get('/enhetsliste', azureSkjemabyggingProxy, enhetsliste.get);
apiRouter.get('/forms', tryCatch(forms.get));
apiRouter.get('/forms/:formPath', tryCatch(form.get));
apiRouter.post('/foersteside', azureSkjemabyggingProxy, forsteside.post);
apiRouter.get('/global-translations/:languageCode', tryCatch(globalTranslations.get));
apiRouter.get('/translations/:form', tryCatch(translations.get));
apiRouter.get('/mottaksadresser', tryCatch(mottaksadresser.get));
apiRouter.get('/send-inn/aktive-opprettede-soknader/:skjemanummer', tokenxSendInn, tryCatch(activeTasks.get));
apiRouter.get('/send-inn/soknad/:innsendingsId', tokenxSendInn, sendInnSoknad.get);
apiRouter.delete('/send-inn/soknad/:innsendingsId', tokenxSendInn, sendInnSoknad.delete);
apiRouter.post('/send-inn/soknad', tokenxSendInn, sendInnSoknad.post);
apiRouter.put('/send-inn/soknad', tokenxSendInn, sendInnSoknad.put);
apiRouter.put('/send-inn/utfyltsoknad', azureSkjemabyggingProxy, tokenxSendInn, sendInnUtfyltSoknad.put);
apiRouter.get('/common-codes/archive-subjects', azureSkjemabyggingProxy, commonCodes.getArchiveSubjects);
apiRouter.post('/pdf/convert', azureSkjemabyggingProxy, exstream.post);
apiRouter.get('/common-codes/currencies', azureSkjemabyggingProxy, commonCodes.getCurrencies);
apiRouter.post('/log/:level', rateLimiter(60000, 60), log.post);
apiRouter.get('/health/status', status.get);
apiRouter.get('/send-inn/prefill-data', tokenxSendInn, prefillData.get);
apiRouter.get('/send-inn/activities', tokenxSendInn, activities.get);

if (featureToggles.enablePdl) {
  apiRouter.get('/pdl/person/:id', tokenxPdl, pdl.person);
  apiRouter.get('/pdl/children/:id', azurePdl, pdl.children);
}

export default apiRouter;
