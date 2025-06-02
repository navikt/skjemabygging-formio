import { LanguagesProvider } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadAllTranslations } from '../../api/useTranslations';
import { NotFoundPage } from '../errors/NotFoundPage';
import FormPageRouter from './FormPageRouter';
import FormPageSkeleton from './FormPageSkeleton';

const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [translations, setTranslations] = useState<I18nTranslations>();
  const [loading, setLoading] = useState<boolean>(true);

  const loadTranslations = useCallback(async () => {
    if (!formPath) {
      return;
    }

    setLoading(true);
    try {
      setTranslations(await loadAllTranslations(formPath));
    } catch (_e) {
      setTranslations(undefined);
    } finally {
      setLoading(false);
    }
  }, [formPath]);

  useEffect(() => {
    (async () => {
      await loadTranslations();
    })();
  }, [formPath, loadTranslations]);

  if (loading) {
    return <FormPageSkeleton />;
  }

  if (!translations) {
    return <NotFoundPage />;
  }

  return (
    <LanguagesProvider translations={translations}>
      <FormPageRouter />
    </LanguagesProvider>
  );
};

export default FormPageWrapper;
