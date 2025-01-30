import { FyllUtRouter } from '@navikt/skjemadigitalisering-shared-components';
import { AppLayout } from '../components/AppLayout';
import { useI18nState } from '../context/i18n/I18nContext';

export function TestFormPage({ form }) {
  const { translationsForNavForm } = useI18nState();

  return (
    <AppLayout
      navBarProps={{
        formMenu: true,
        formPath: form.path,
      }}
    >
      <FyllUtRouter form={form} translations={translationsForNavForm} />
    </AppLayout>
  );
}
