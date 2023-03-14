import apiConfig from "./routers/api/config.js";
import countries from "./routers/api/countries.js";
import form from "./routers/api/form.js";
import forms from "./routers/api/forms.js";
import globalTranslations from "./routers/api/global-translations.js";
import mottaksadresser from "./routers/api/mottaksadresser.js";
import translations from "./routers/api/translations.js";

export const setupDeprecatedEndpoints = (skjemaApp) => {
  // TODO fjern når vi har tatt i bruk tilsvarende endepunkt under /api
  skjemaApp.get("/forms", forms.get);
  skjemaApp.get("/forms/:formPath", form.get);
  skjemaApp.get("/global-translations/:languageCode", globalTranslations.get);
  skjemaApp.get("/config", apiConfig.get);
  skjemaApp.get("/countries", countries.get); // TODO Krever migrering av skjemadefinisjoner
  skjemaApp.get("/mottaksadresser", mottaksadresser.get);
  skjemaApp.get("/translations/:form", translations.get);
};
