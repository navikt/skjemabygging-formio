import { Skeleton } from '@navikt/ds-react';
import { FyllUtRouter, i18nUtils, SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { useMemo } from 'react';
import { AppLayout } from '../components/AppLayout';
import RowLayout from '../components/layout/RowLayout';
import { useFormTranslations } from '../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../context/translations/GlobalTranslationsContext';

export function TestFormPage({ form }) {
  const { isReady: formTranslationIsReady, translations: formTranslations } = useFormTranslations();
  const { isReady: globalTranslationIsReady, translations: globalTranslations } = useGlobalTranslations();

  const i18n = useMemo(() => {
    if (!(formTranslationIsReady && globalTranslationIsReady)) return undefined;
    return i18nUtils.mapFormsApiTranslationsToI18n([...formTranslations, ...globalTranslations], true);
  }, [formTranslationIsReady, formTranslations, globalTranslationIsReady, globalTranslations]);

  if (!(form && formTranslationIsReady && globalTranslationIsReady)) {
    return (
      <>
        <RowLayout>
          <Skeleton height={'16rem'} />
          <SkeletonList size={8} height={'4rem'} />
        </RowLayout>
      </>
    );
  }

  return (
    <AppLayout
      navBarProps={{
        formMenu: true,
        formPath: form.path,
      }}
    >
      <FyllUtRouter form={form} translations={i18n} />
    </AppLayout>
  );
}
