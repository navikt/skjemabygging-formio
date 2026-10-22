import { Provider as AkselProvider } from '@navikt/ds-react';
import {
  FormsApiTranslationMap,
  ResponseError,
  sendinnEntryUtils,
  sendinnLanguageUtils,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { SessionExpiredMessage } from '../app/error/SessionExpiredMessage';
import http from '../app/http/http';
import { getAkselLocale } from '../app/language/akselLocale';
import SkeletonList from '../app/loading/SkeletonList';
import { LanguageProvider } from '../context/language/LanguageContext';

interface Props {
  children: ReactNode;
  loadGlobalTranslations: (language: TranslationLang) => Promise<FormsApiTranslationMap>;
  onLoadError?: (error: unknown) => void;
}

type TranslationState =
  | { status: 'loading' }
  | { status: 'loaded'; language: TranslationLang; translations: FormsApiTranslationMap }
  | { status: 'sessionExpired' };

/**
 * Selects the language from the lang query parameter and loads the global translations for it.
 * Bokmål texts are the translation keys, so nb needs no fetch, and a failed fetch falls back to nb.
 */
const SendinnTranslationProvider = ({ children, loadGlobalTranslations, onLoadError }: Props) => {
  const { pathname, search } = useLocation();
  const currentLanguage = sendinnLanguageUtils.getSelectedLanguage(new URLSearchParams(search));
  const [state, setState] = useState<TranslationState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (currentLanguage === 'nb') {
        return {};
      }
      return loadGlobalTranslations(currentLanguage);
    };

    load()
      .then((translations) => {
        if (!cancelled) setState({ status: 'loaded', language: currentLanguage, translations });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (http.isAuthenticationError(error as ResponseError)) {
          setState({ status: 'sessionExpired' });
          return;
        }
        onLoadError?.(error);
        setState({ status: 'loaded', language: currentLanguage, translations: {} });
      });

    return () => {
      cancelled = true;
    };
  }, [currentLanguage, loadGlobalTranslations, onLoadError]);

  // Keeps the previous language until the translations for the new one have loaded.
  const language = state.status === 'loaded' ? state.language : currentLanguage;
  const translations = state.status === 'loaded' ? state.translations : {};
  const loginUrl = sendinnEntryUtils.createLoginUrl(`${sendinnEntryUtils.basePath}${pathname}${search}`);

  return (
    <LanguageProvider
      translations={translations}
      currentLanguage={language}
      availableLanguages={sendinnLanguageUtils.languages}
    >
      <AkselProvider locale={getAkselLocale(language)}>
        {state.status === 'loading' && <SkeletonList size={3} />}
        {state.status === 'sessionExpired' && <SessionExpiredMessage loginUrl={loginUrl} />}
        {state.status === 'loaded' && children}
      </AkselProvider>
    </LanguageProvider>
  );
};

export { SendinnTranslationProvider };
