import apiConfig from './routers/api/config';
import form from './routers/api/form';
import forms from './routers/api/forms';
import globalTranslations from './routers/api/global-translations.js';
import translations from './routers/api/translations.js';

export const setupDeprecatedEndpoints = (skjemaApp) => {
  // TODO fjern når vi har tatt i bruk tilsvarende endepunkt under /api
  skjemaApp.get('/forms', forms.get);
  skjemaApp.get('/forms/:formPath', form.get);
  skjemaApp.get('/global-translations/:languageCode', globalTranslations.get);
  skjemaApp.get('/config', apiConfig.get);
  skjemaApp.get('/translations/:form', translations.get);
};
