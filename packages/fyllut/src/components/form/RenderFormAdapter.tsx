import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslationMap, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ApplicationProvider,
  FyllutContextValue,
  RenderForm,
  RenderFormProps,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useLocation } from 'react-router';
import { getAvailableLanguages, getCurrentLanguage } from './newRendererLanguageUtils';

type Props = Omit<RenderFormProps, 'fyllut' | 'language' | 'services' | 'submissionMethod'> & {
  initialLanguage?: TranslationLang;
  services: RuntimeServices;
  translations: FormsApiTranslationMap;
};

const RenderFormAdapter = ({ form, initialLanguage, services, translations, ...props }: Props) => {
  const appConfig = useAppConfig();
  const { search } = useLocation();
  const availableLanguages = getAvailableLanguages(form, translations);
  const currentLanguage =
    initialLanguage && availableLanguages.includes(initialLanguage)
      ? initialLanguage
      : getCurrentLanguage(search, availableLanguages);
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
