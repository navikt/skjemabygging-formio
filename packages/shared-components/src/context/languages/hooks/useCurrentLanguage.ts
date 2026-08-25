import { I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { resolveLanguageCode } from '../languageUtils';

const useCurrentLanguage = (languageCodeFromUrl: string | undefined, translations: I18nTranslations) => {
  const currentLanguage = useMemo(
    () => resolveLanguageCode(languageCodeFromUrl, translations),
    [languageCodeFromUrl, translations],
  );

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return { currentLanguage, initialLanguage: currentLanguage };
};

export default useCurrentLanguage;
