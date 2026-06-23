import {
  createApplicationPdfService,
  createCoverPageService,
  createFormService,
  createMergeFileService,
  createNavUnitService,
  createRecipientService,
  createStaticPdfService,
  createTranslationService,
} from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import ApplicationService from './nologin/ApplicationService';
import NologinTokenService from './nologin/NologinTokenService';
import TranslationsService from './TranslationsService';

const appMetrics: AppMetrics = new AppMetrics();
const {
  familiePdfGeneratorUrl,
  formsApiUrl,
  sendInnConfig,
  skjemabyggingProxyUrl,
  useFormsApiStaging,
  skjemaDir,
  translationDir,
  resourcesDir,
  mocksEnabled,
  norg2,
  clientId,
} = config;

const applicationPdfService = createApplicationPdfService({
  baseUrl: familiePdfGeneratorUrl,
  metrics: {
    appName: 'fyllut',
    registry: appMetrics.register,
  },
});

const coverPageService = createCoverPageService({
  baseUrl: skjemabyggingProxyUrl,
});

const formService = createFormService({
  baseUrl: formsApiUrl,
  formsApiStaging: useFormsApiStaging,
  formsLocation: skjemaDir,
  mocksEnabled,
});

const mergeFileService = createMergeFileService({
  baseUrl: `${sendInnConfig.host}${sendInnConfig.paths.mergeFiles}`,
});

const navUnitService = createNavUnitService({
  baseUrl: norg2.url,
  consumerId: clientId,
});

const recipientService = createRecipientService({
  baseUrl: formsApiUrl,
});

const staticPdfService = createStaticPdfService({
  baseUrl: formsApiUrl,
});

const translationService = createTranslationService({
  baseUrl: formsApiUrl,
  formsApiStaging: useFormsApiStaging,
  translationsLocation: translationDir,
  globalTranslationsLocation: resourcesDir,
  mocksEnabled,
});

const translationsService = new TranslationsService(config);

const applicationService = new ApplicationService(config, applicationPdfService);

const nologinTokenService = NologinTokenService(config);

export {
  applicationPdfService,
  applicationService,
  appMetrics,
  coverPageService,
  formService,
  mergeFileService,
  navUnitService,
  nologinTokenService,
  recipientService,
  staticPdfService,
  translationService,
  translationsService,
};
