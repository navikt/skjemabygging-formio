import AppMetrics from "./AppMetrics";
import FormService from "./FormService";
import TranslationsService from "./TranslationsService";

const translationsService = new TranslationsService();

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

export { formService, translationsService, appMetrics };
