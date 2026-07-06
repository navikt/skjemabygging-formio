import {
  createActiveTaskService,
  createApplicationPdfService,
  createCommonCodesService,
  createCoverPageService,
  createFormService,
  createMergeFileService,
  createNavUnitService,
  createPrefillService,
  createRecipientService,
  createRegisterDataService,
  createStaticPdfService,
  createTeamLogger,
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
  kodeverk,
  clientId,
  teamLogsConfig,
  norg2,
  tilleggsstonaderConfig,
} = config;

const teamLogger = createTeamLogger(teamLogsConfig);

const applicationPdfService = createApplicationPdfService({
  baseUrl: familiePdfGeneratorUrl,
  metrics: {
    appName: 'fyllut',
    registry: appMetrics.register,
  },
  teamLogger,
});

const activeTaskService = createActiveTaskService({
  baseUrl: sendInnConfig.host,
});

const coverPageService = createCoverPageService({
  baseUrl: skjemabyggingProxyUrl,
});

const commonCodesService = createCommonCodesService({
  baseUrl: kodeverk.url,
  consumerId: clientId,
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

const prefillService = createPrefillService({
  baseUrl: `${sendInnConfig.host}${sendInnConfig.paths.prefillData}`,
});

const registerDataService = createRegisterDataService({
  tilleggsstonaderBaseUrl: tilleggsstonaderConfig.host,
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
  activeTaskService,
  applicationPdfService,
  applicationService,
  appMetrics,
  commonCodesService,
  coverPageService,
  formService,
  mergeFileService,
  navUnitService,
  nologinTokenService,
  prefillService,
  recipientService,
  registerDataService,
  staticPdfService,
  translationService,
  translationsService,
};
