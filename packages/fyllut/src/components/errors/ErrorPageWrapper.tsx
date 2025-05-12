import { LanguagesProvider } from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useState } from 'react';
import { loadGlobalTranslationsForLanguages } from '../../util/api';
import { InternalServerErrorPage } from './InternalServerErrorPage';
import { NotFoundPage } from './NotFoundPage';

export function ErrorPageWrapper({ statusCode }: { statusCode: number }) {
  const [translations, setTranslations] = useState({});

  const fetchTranslations = async () => {
    const globalTranslations = await loadGlobalTranslationsForLanguages([]);
    setTranslations(globalTranslations);
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  return (
    <LanguagesProvider translations={translations}>
      {statusCode === 404 ? <NotFoundPage /> : <InternalServerErrorPage />}
    </LanguagesProvider>
  );
}
