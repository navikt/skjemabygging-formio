import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import {
  ApplicationProvider,
  FyllutContextValue,
  RenderForm,
  RenderFormProps,
} from '@navikt/skjemadigitalisering-shared-frontend';

type Props = Omit<RenderFormProps, 'fyllut' | 'language' | 'submissionMethod'>;

const RenderFormAdapter = (props: Props) => {
  const appConfig = useAppConfig();
  const { availableLanguages, currentLanguage, translate } = useLanguages();
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
        submissionMethod={appConfig.submissionMethod}
        fyllut={fyllut}
        language={{ availableLanguages, currentLanguage, translate }}
      />
    </ApplicationProvider>
  );
};

export default RenderFormAdapter;
