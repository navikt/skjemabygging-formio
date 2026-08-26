import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ApplicationProvider,
  FyllutContextValue,
  RenderForm,
  RenderFormProps,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useLocation } from 'react-router';
import { getAvailableLanguages, getCurrentLanguage } from './newRendererLanguageUtils';

type Props = Omit<RenderFormProps, 'fyllut' | 'language' | 'submissionMethod'> & {
  translations: FormsApiTranslationMap;
};

const RenderFormAdapter = ({ form, translations, ...props }: Props) => {
  const appConfig = useAppConfig();
  const { search } = useLocation();
  const availableLanguages = getAvailableLanguages(form, translations);
  const currentLanguage = getCurrentLanguage(search, availableLanguages);
  const http = appConfig.http;
  const downloadPdf = http
    ? (url: string, body: object) =>
        http.post<Blob>(url, body, {
          Accept: http.MimeType.PDF,
        })
    : undefined;
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
      />
    </ApplicationProvider>
  );
};

export default RenderFormAdapter;
