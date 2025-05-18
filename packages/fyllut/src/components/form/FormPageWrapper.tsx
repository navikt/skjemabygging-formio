import { LanguagesProvider } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadAllTranslations } from '../../api/useTranslations';
import FormPageRouter from './FormPageRouter';
import FormPageSkeleton from './FormPageSkeleton';

const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [translations, setTranslations] = useState<I18nTranslations>();

  const loadTranslations = useCallback(async () => {
    if (!formPath) {
      return;
    }
    setTranslations(await loadAllTranslations(formPath));
  }, [formPath]);

  useEffect(() => {
    (async () => {
      await loadTranslations();
    })();
  }, [formPath, loadTranslations]);

  if (!translations) {
    return <FormPageSkeleton />;
  }

  return (
    <LanguagesProvider translations={translations}>
      <FormPageRouter />
    </LanguagesProvider>
  );
};

export default FormPageWrapper;
