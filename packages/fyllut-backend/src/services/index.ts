import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import FormService from './FormService';
import NoLoginFileService from './NoLoginFileService';
import TranslationsService from './TranslationsService';

const translationsService = new TranslationsService(config);

const noLoginFileService = new NoLoginFileService(config);

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

export { appMetrics, formService, noLoginFileService, translationsService };
