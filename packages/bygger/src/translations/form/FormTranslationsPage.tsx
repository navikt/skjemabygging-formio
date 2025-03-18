import { Form, FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import SidebarLayout from '../../components/layout/SidebarLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditFormTranslationsProvider from '../../context/translations/EditFormTranslationsContext';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import UnusedTranslations from '../components/UnusedTranslations';
import { generateAndPopulateTranslationsForForm } from '../utils/editFormTranslationsUtils';
import FormTranslationButtonsColumn from './FormTranslationButtonsColumn';
import FormTranslationsTable from './FormTranslationsTable';

interface Props {
  form: Form;
}

const FormTranslationsPage = ({ form }: Props) => {
  const { storedTranslations, isReady: isTranslationsReady, deleteTranslation } = useFormTranslations();
  const { storedTranslations: globalTranslations, isReady: isGlobalTranslationsReady } = useGlobalTranslations();

  const translations: FormsApiFormTranslation[] = useMemo(
    () => generateAndPopulateTranslationsForForm(form, storedTranslations, globalTranslations),
    [form, globalTranslations, storedTranslations],
  );

  const unusedTranslations = useMemo(() => {
    return Object.values(storedTranslations).filter(
      (storedTranslation) => !translations.some((translation) => translation.key === storedTranslation.key),
    );
  }, [storedTranslations, translations]);

  const initialChanges = useMemo(() => {
    if (isTranslationsReady && isGlobalTranslationsReady) {
      return translations.filter(
        (translation) => translation.globalTranslationId && !storedTranslations[translation.key]?.globalTranslationId,
      );
    }
  }, [isGlobalTranslationsReady, isTranslationsReady, translations, storedTranslations]);

  return (
    <AppLayout navBarProps={{ formMenu: true, formPath: form.path }}>
      <TitleRowLayout>
        <Title>
          {form.skjemanummer}, {form.title}
        </Title>
      </TitleRowLayout>
      <EditFormTranslationsProvider initialChanges={initialChanges}>
        <form onSubmit={(event) => event.preventDefault()}>
          <RowLayout
            right={
              <SidebarLayout noScroll>
                <FormTranslationButtonsColumn form={form} />
              </SidebarLayout>
            }
          >
            <UnusedTranslations translations={unusedTranslations} onRemove={deleteTranslation} />
            <FormTranslationsTable translations={translations} loading={!initialChanges} />
          </RowLayout>
        </form>
      </EditFormTranslationsProvider>
    </AppLayout>
  );
};
export default FormTranslationsPage;
