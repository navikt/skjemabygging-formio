import {
  createApplicationPdfService,
  createApplicationService,
  createCoverPageService,
  createFormService,
  createMergeFileService,
  createRecipientService,
  createStaticPdfService,
  createTeamLogger,
  createTranslationService,
} from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config/config';
import AppMetrics from './AppMetrics';
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
  teamLogsConfig,
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

const applicationService = createApplicationService({
  baseUrl: sendInnConfig.host,
  paths: {
    soknad: sendInnConfig.paths.soknad,
    utfyltSoknad: sendInnConfig.paths.utfyltSoknad,
  },
  metrics: {
    uploadDuration: appMetrics.innsendingApiUploadDuration,
    uploadFileSize: appMetrics.innsendingApiUploadFileSize,
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

const nologinTokenService = NologinTokenService(config);

export {
  applicationPdfService,
  applicationService,
  appMetrics,
  coverPageService,
  formService,
  mergeFileService,
  nologinTokenService,
  recipientService,
  staticPdfService,
  translationService,
  translationsService,
};
