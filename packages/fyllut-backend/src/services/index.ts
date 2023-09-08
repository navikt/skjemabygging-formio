import AppMetrics from "./AppMetrics";
import FormService from "./FormService";
import TranslationsService from "./TranslationsService";
import { config } from "../config/config";

const translationsService = new TranslationsService(config);

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

export { formService, translationsService, appMetrics };
