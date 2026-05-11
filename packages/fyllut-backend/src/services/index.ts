import { createApplicationPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { config } from '../config/config';
import AppMetrics from './AppMetrics';
import FormService from './FormService';
import createOutgoingServiceMetrics from './metrics/outgoingServiceMetrics';
import ApplicationService from './nologin/ApplicationService';
import NologinTokenService from './nologin/NologinTokenService';
import TranslationsService from './TranslationsService';

const appMetrics: AppMetrics = new AppMetrics();

const applicationPdfService = createApplicationPdfService({
  metrics: createOutgoingServiceMetrics(appMetrics, {
    requestCounter: appMetrics.familiePdfRequestsCounter,
    failureCounter: appMetrics.familiePdfFailuresCounter,
  }),
});

const translationsService = new TranslationsService(config);

const applicationService = new ApplicationService(config, applicationPdfService);

const formService = new FormService();

const nologinTokenService = NologinTokenService(config);

export { applicationPdfService, applicationService, appMetrics, formService, nologinTokenService, translationsService };
