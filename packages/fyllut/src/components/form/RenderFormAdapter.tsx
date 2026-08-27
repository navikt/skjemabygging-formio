import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ApplicationProvider,
  FyllutContextValue,
  RenderForm,
  RenderFormProps,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useMemo } from 'react';
import { useLocation } from 'react-router';
import createFormDataService from '../../services/createFormDataService';
import { getAvailableLanguages, getCurrentLanguage } from './newRendererLanguageUtils';

type Props = Omit<RenderFormProps, 'fyllut' | 'language' | 'services' | 'submissionMethod'> & {
  translations: FormsApiTranslationMap;
};

const RenderFormAdapter = ({ form, translations, ...props }: Props) => {
  const appConfig = useAppConfig();
  const { search } = useLocation();
  const availableLanguages = getAvailableLanguages(form, translations);
  const currentLanguage = getCurrentLanguage(search, availableLanguages);
  const http = appConfig.http;
  if (!http) {
    throw new Error('Fyllut HTTP client is required to render the form.');
  }
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const services = useMemo<RuntimeServices>(
    () => ({
      formData: createFormDataService({
        http,
        backendBaseUrl: appConfig.baseUrl ?? '/fyllut',
        innsendingsId,
      }),
    }),
    [appConfig.baseUrl, http, innsendingsId],
  );
  const downloadPdf = (url: string, body: object) =>
    http.post<Blob>(url, body, {
      Accept: http.MimeType.PDF,
    });
  const fyllut: FyllutContextValue = {
    baseUrl: appConfig.baseUrl,
    fyllutBaseUrl: appConfig.fyllutBaseURL,
    isLoggedIn: appConfig.config?.isLoggedIn,
    http,
    logEvent: appConfig.logEvent,
    downloadPdf,
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
