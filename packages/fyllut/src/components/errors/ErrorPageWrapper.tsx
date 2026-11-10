import { LanguagesProvider } from '@navikt/skjemadigitalisering-shared-components';
import { ErrorPageLayout } from '@navikt/skjemadigitalisering-shared-frontend';
import { ReactNode, useEffect, useState } from 'react';
import { loadGlobalTranslationsForLanguages } from '../../api/useTranslations';

export function ErrorPageWrapper({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState({});

  const fetchTranslations = async () => {
    const globalTranslations = await loadGlobalTranslationsForLanguages([]);
    setTranslations(globalTranslations);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch updates local state after loading translations.
    fetchTranslations();
  }, []);

  return (
    <LanguagesProvider translations={translations}>
      <ErrorPageLayout>{children}</ErrorPageLayout>
    </LanguagesProvider>
  );
}
