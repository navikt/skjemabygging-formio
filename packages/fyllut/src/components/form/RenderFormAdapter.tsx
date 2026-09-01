import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslationMap, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ApplicationProvider,
  FyllutContextValue,
  RenderForm,
  RenderFormProps,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getAvailableLanguages, resolveActiveLanguage } from './newRendererLanguageUtils';

type Props = Omit<RenderFormProps, 'fyllut' | 'language' | 'services' | 'submissionMethod'> & {
  initialLanguage?: TranslationLang;
  services: RuntimeServices;
  translations: FormsApiTranslationMap;
};

const RenderFormAdapter = ({ form, initialLanguage, services, translations, ...props }: Props) => {
  const appConfig = useAppConfig();
  const fyllutBaseUrl = appConfig.fyllutBaseURL;
  if (!fyllutBaseUrl) {
    throw new Error('fyllutBaseURL is required to render the new fyllut form flow.');
  }

  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const availableLanguages = getAvailableLanguages(form, translations);
  const hasLanguageParam = new URLSearchParams(search).has('lang');
  const seedLanguage = initialLanguage && availableLanguages.includes(initialLanguage) ? initialLanguage : undefined;
  const currentLanguage = resolveActiveLanguage(search, availableLanguages, initialLanguage);

  // Seed the URL with the draft language on first load so it stays authoritative across refreshes.
  useEffect(() => {
    if (hasLanguageParam || !seedLanguage) {
      return;
    }
    const nextParams = new URLSearchParams(search);
    nextParams.set('lang', seedLanguage);
    navigate({ pathname, search: `?${nextParams.toString()}` }, { replace: true });
  }, [hasLanguageParam, navigate, pathname, search, seedLanguage]);

  const fyllut: FyllutContextValue = {
    fyllutBaseUrl,
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
