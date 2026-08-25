import {
  I18nTranslationReplacements,
  I18nTranslations,
  Tkey,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import useCurrentLanguage from './hooks/useCurrentLanguage';
import useLanguageCodeFromURL from './hooks/useLanguageCodeFromURL';
import { normalizeTranslations } from './languageUtils';

interface LanguageContextType {
  availableLanguages: string[];
  currentLanguage: string;
  initialLanguage: string;
  translate: (textOrKey?: string | Tkey, params?: Record<string | number, any>) => string;
  translationsForNavForm: object;
}

interface Props {
  translations: I18nTranslations;
  children: ReactNode;
}

const LanguagesContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguagesProvider = ({ children, translations }: Props) => {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [translationsForNavForm, setTranslationsForNavForm] = useState<object>({});
  const normalizedTranslations = useMemo(() => normalizeTranslations(translations), [translations]);

  const languageCodeFromUrl: string = useLanguageCodeFromURL() ?? 'nb';
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, normalizedTranslations);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep derived language list in sync with loaded translations.
    setAvailableLanguages(Object.keys(normalizedTranslations));
  }, [normalizedTranslations]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- provide latest translations to NavForm integration state.
    setTranslationsForNavForm(normalizedTranslations);
  }, [normalizedTranslations]);

  const translate = (textOrKey: string | Tkey = '', params?: I18nTranslationReplacements): string => {
    return translationUtils.translateWithTextReplacements({
      textOrKey,
      params,
      translations: normalizedTranslations,
      currentLanguage,
    });
  };

  return (
    <LanguagesContext.Provider
      value={{
        availableLanguages,
        currentLanguage,
        initialLanguage,
        translate,
        translationsForNavForm,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);

export type { LanguageContextType };
