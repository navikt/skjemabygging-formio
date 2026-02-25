import { Form, FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
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
import {
  generateAndPopulateTranslationsForForm,
  generateUnsavedGlobalTranslations,
} from '../utils/editFormTranslationsUtils';
import FormTranslationButtonsColumn from './FormTranslationButtonsColumn';
import FormTranslationsTable from './FormTranslationsTable';

interface Props {
  form: Form;
}

const FormTranslationsPage = ({ form }: Props) => {
  const { storedTranslations, isReady: isTranslationsReady, lastSave, deleteTranslation } = useFormTranslations();
  const { storedTranslations: globalTranslations, isReady: isGlobalTranslationsReady } = useGlobalTranslations();

  const generatedTranslations: FormsApiTranslation[] = useMemo(
    () => generateAndPopulateTranslationsForForm(form, storedTranslations, globalTranslations),
    [form, globalTranslations, storedTranslations],
  );

  const unusedTranslations = useMemo(() => {
    return Object.values(storedTranslations).filter(
      (storedTranslation) => !generatedTranslations.some((translation) => translation.key === storedTranslation.key),
    );
  }, [storedTranslations, generatedTranslations]);

  const initialChanges = useMemo(() => {
    if (isTranslationsReady && isGlobalTranslationsReady) {
      return generateUnsavedGlobalTranslations(form, storedTranslations, globalTranslations);
    }
  }, [isTranslationsReady, isGlobalTranslationsReady, form, storedTranslations, globalTranslations]);

  return (
    <AppLayout navBarProps={{ formMenu: true, formPath: form.path }} form={form}>
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
                <FormTranslationButtonsColumn form={form} lastSave={lastSave} />
              </SidebarLayout>
            }
          >
            <UnusedTranslations translations={unusedTranslations} onRemove={deleteTranslation} />
            <FormTranslationsTable translations={generatedTranslations} loading={!initialChanges} />
          </RowLayout>
        </form>
      </EditFormTranslationsProvider>
    </AppLayout>
  );
};
export default FormTranslationsPage;
