import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslationMap, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import {
  ApplicationProvider,
  IntegrationContextValue,
  RenderForm,
  RenderFormProps,
  RuntimeServices,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getAvailableLanguages, resolveActiveLanguage } from './newRendererLanguageUtils';
import resolveSubmissionMethod from './resolveSubmissionMethod';

type Props = Omit<RenderFormProps, 'integration' | 'language' | 'services' | 'submissionMethod'> & {
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

  // The 'sub' query param can change via client-side navigation (e.g. choosing a submission method),
  // so it must be re-read from the reactive location on every render rather than relying solely on
  // the app config value, which is only resolved once at initial page load.
  const submissionMethod = resolveSubmissionMethod(search, appConfig.submissionMethod);

  // Seed the URL with the draft language on first load so it stays authoritative across refreshes.
  useEffect(() => {
    if (hasLanguageParam || !seedLanguage) {
      return;
    }
    const nextParams = new URLSearchParams(search);
    nextParams.set('lang', seedLanguage);
    navigate({ pathname, search: `?${nextParams.toString()}` }, { replace: true });
  }, [hasLanguageParam, navigate, pathname, search, seedLanguage]);

  const integration: IntegrationContextValue = {
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
        submissionMethod={submissionMethod}
        integration={integration}
        language={{ availableLanguages, currentLanguage, translations }}
        services={services}
      />
    </ApplicationProvider>
  );
};

export default RenderFormAdapter;
