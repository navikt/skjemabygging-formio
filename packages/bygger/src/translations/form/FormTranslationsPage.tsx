import { Form, FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import SidebarLayout from '../../components/layout/SidebarLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditFormTranslationsProvider, {
  EditFormTranslationsContext,
} from '../../context/translations/EditFormTranslationsContext';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import TranslationTable from '../components/TranslationTable';
import { generateAndPopulateTranslationsForForm } from '../utils/editFormTranslationsUtils';
import FormTranslationButtonsColumn from './FormTranslationButtonsColumn';

interface Props {
  form: Form;
}

const FormTranslationsPage = ({ form }: Props) => {
  const { storedTranslations, isReady: isTranslationsReady } = useFormTranslations();
  const { storedTranslations: globalTranslations, isReady: isGlobalTranslationsReady } = useGlobalTranslations();

  const rows: FormsApiFormTranslation[] = useMemo(
    () => generateAndPopulateTranslationsForForm(form, storedTranslations, globalTranslations),
    [form, globalTranslations, storedTranslations],
  );

  const initialChanges = useMemo(() => {
    if (isTranslationsReady && isGlobalTranslationsReady) {
      return rows
        .map((row) => (row.globalTranslationId && !storedTranslations[row.key]?.globalTranslationId ? row : undefined))
        .filter((value) => !!value);
    }
  }, [isGlobalTranslationsReady, isTranslationsReady, rows, storedTranslations]);

  return (
    <AppLayout navBarProps={{ formMenu: true, formPath: form.path }}>
      <TitleRowLayout>
        <Title>
          {form.properties.skjemanummer}, {form.title}
        </Title>
      </TitleRowLayout>
      <EditFormTranslationsProvider initialChanges={initialChanges}>
        <form>
          <RowLayout
            right={
              <SidebarLayout noScroll>
                <FormTranslationButtonsColumn form={form} />
              </SidebarLayout>
            }
          >
            <TranslationTable rows={rows} loading={!initialChanges} editContext={EditFormTranslationsContext} />
          </RowLayout>
        </form>
      </EditFormTranslationsProvider>
    </AppLayout>
  );
};
export default FormTranslationsPage;
