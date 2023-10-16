import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import FormService from './FormService';
import TranslationsService from './TranslationsService';

const translationsService = new TranslationsService(config);

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

export { appMetrics, formService, translationsService };
