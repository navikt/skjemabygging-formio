import { LanguagesProvider } from '@navikt/skjemadigitalisering-shared-components';
import { ReactNode, useEffect, useState } from 'react';
import { loadGlobalTranslationsForLanguages } from '../../util/api';

export function ErrorPageWrapper({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState({});

  const fetchTranslations = async () => {
    const globalTranslations = await loadGlobalTranslationsForLanguages([]);
    setTranslations(globalTranslations);
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  return <LanguagesProvider translations={translations}>{children}</LanguagesProvider>;
}
