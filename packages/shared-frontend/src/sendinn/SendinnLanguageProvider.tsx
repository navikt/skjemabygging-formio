import { Provider as AkselProvider } from '@navikt/ds-react';
import {
  FormsApiTranslationMap,
  ResponseError,
  sendinnEntryUtils,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { SessionExpiredMessage } from '../app/error/SessionExpiredMessage';
import http from '../app/http/http';
import { getAkselLocale } from '../app/language/akselLocale';
import { getCurrentLanguage } from '../app/language/languageUtils';
import SkeletonList from '../app/loading/SkeletonList';
import { LanguageProvider } from '../context/language/LanguageContext';

const availableLanguages: TranslationLang[] = ['nb', 'nn', 'en'];

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
const SendinnLanguageProvider = ({ children, loadGlobalTranslations, onLoadError }: Props) => {
  const { pathname, search } = useLocation();
  const currentLanguage = getCurrentLanguage(search, availableLanguages);
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

  const translations = state.status === 'loaded' ? state.translations : {};
  const loginUrl = useMemo(
    () => sendinnEntryUtils.createLoginUrl(`${sendinnEntryUtils.basePath}${pathname}${search}`),
    [pathname, search],
  );

  return (
    <LanguageProvider
      translations={translations}
      currentLanguage={currentLanguage}
      availableLanguages={availableLanguages}
    >
      <AkselProvider locale={getAkselLocale(currentLanguage)}>
        {state.status === 'loading' && <SkeletonList size={3} />}
        {state.status === 'sessionExpired' && <SessionExpiredMessage loginUrl={loginUrl} />}
        {state.status === 'loaded' && children}
      </AkselProvider>
    </LanguageProvider>
  );
};

export { SendinnLanguageProvider };
