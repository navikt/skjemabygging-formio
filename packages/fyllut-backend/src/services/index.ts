import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import FormService from './FormService';
import NologinService from './nologin/NologinService';
import NologinTokenService from './nologin/NologinTokenService';
import TranslationsService from './TranslationsService';

const translationsService = new TranslationsService(config);

const nologinService = new NologinService(config);

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

const nologinTokenService = NologinTokenService(config);

export { appMetrics, formService, nologinService, nologinTokenService, translationsService };
