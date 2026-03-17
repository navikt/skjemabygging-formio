import apiConfig from './routers/api/config';
import forms from './routers/api/forms';
import form from './routers/api/forms/form';
import globalTranslations from './routers/api/global-translations';
import translations from './routers/api/translations';

export const setupDeprecatedEndpoints = (skjemaApp) => {
  // TODO fjern når vi har tatt i bruk tilsvarende endepunkt under /api
  skjemaApp.get('/forms', forms.get);
  skjemaApp.get('/forms/:formPath', form.get);
  skjemaApp.get('/global-translations/:languageCode', globalTranslations.get);
  skjemaApp.get('/config', apiConfig.get);
  skjemaApp.get('/translations/:form', translations.get);
};
