import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslationMap, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ApplicationProvider,
  FyllutContextValue,
  RenderForm,
  RenderFormProps,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo } from 'react';
import { useLocation } from 'react-router';
import createApplicationService from '../../adapter-services/createApplicationService';
import createAttachmentService from '../../adapter-services/createAttachmentService';
import createFormDataService from '../../adapter-services/createFormDataService';
import createSessionService from '../../adapter-services/createSessionService';
import createSubmissionService from '../../adapter-services/createSubmissionService';
import { getAvailableLanguages, getCurrentLanguage } from './newRendererLanguageUtils';

type Props = Omit<RenderFormProps, 'fyllut' | 'language' | 'services' | 'submissionMethod'> & {
  initialLanguage?: TranslationLang;
  translations: FormsApiTranslationMap;
};

const RenderFormAdapter = ({ form, initialLanguage, translations, ...props }: Props) => {
  const appConfig = useAppConfig();
  const { search } = useLocation();
  const availableLanguages = getAvailableLanguages(form, translations);
  const currentLanguage =
    initialLanguage && availableLanguages.includes(initialLanguage)
      ? initialLanguage
      : getCurrentLanguage(search, availableLanguages);
  const http = appConfig.http;
  if (!http) {
    throw new Error('Fyllut HTTP client is required to render the form.');
  }
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const services = useMemo<RuntimeServices>(
    () => ({
      applications: createApplicationService({
        http,
        backendBaseUrl: appConfig.baseUrl ?? '/fyllut',
      }),
      attachments: createAttachmentService({
        http,
        backendBaseUrl: appConfig.baseUrl ?? '/fyllut',
      }),
      formData: createFormDataService({
        http,
        backendBaseUrl: appConfig.baseUrl ?? '/fyllut',
        innsendingsId,
      }),
      sessions: createSessionService({
        http,
        backendBaseUrl: appConfig.baseUrl ?? '/fyllut',
      }),
      submissions: createSubmissionService({
        http,
        backendBaseUrl: appConfig.baseUrl ?? '/fyllut',
        createPdf: (url, body) =>
          http.post<Blob>(url, body, {
            Accept: http.MimeType.PDF,
          }),
      }),
    }),
    [appConfig.baseUrl, http, innsendingsId],
  );
  const fyllut: FyllutContextValue = {
    fyllutBaseUrl: appConfig.fyllutBaseURL,
    isLoggedIn: appConfig.config?.isLoggedIn,
    logEvent: appConfig.logEvent,
  };
  const environment = appConfig.config?.NAIS_CLUSTER_NAME === 'prod-gcp' ? 'production' : 'development';

  return (
    <ApplicationProvider environment={environment} logger={appConfig.logger}>
      <RenderForm
        {...props}
        form={form}
        submissionMethod={appConfig.submissionMethod}
        fyllut={fyllut}
        language={{ availableLanguages, currentLanguage, translations }}
        services={services}
      />
    </ApplicationProvider>
  );
};

export default RenderFormAdapter;
