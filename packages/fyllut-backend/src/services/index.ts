import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import FormService from './FormService';
import TranslationsService from './TranslationsService';
import { createCache } from './cache/cache';
import { Cache } from './cache/types';
import { createCaptchaService } from './captcha/captcha';

const translationsService = new TranslationsService(config);

const formService = new FormService();

const appMetrics: AppMetrics = new AppMetrics();

const cache: Cache = await createCache();

const captchaService = createCaptchaService(cache);

export { appMetrics, captchaService, formService, translationsService };
