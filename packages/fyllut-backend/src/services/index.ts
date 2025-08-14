import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import FormService from './FormService';
import TranslationsService from './TranslationsService';
import NologinService from './nologin/NologinService';

const translationsService = new TranslationsService(config);

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

const nologinService = NologinService(config);

export { appMetrics, formService, nologinService, translationsService };
