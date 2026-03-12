import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import FormService from './FormService';
import ApplicationService from './nologin/ApplicationService';
import NologinTokenService from './nologin/NologinTokenService';
import TranslationsService from './TranslationsService';

const translationsService = new TranslationsService(config);

const applicationService = new ApplicationService(config);

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

const nologinTokenService = NologinTokenService(config);

export { applicationService, appMetrics, formService, nologinTokenService, translationsService };
