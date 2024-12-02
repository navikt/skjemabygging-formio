import { FormsApiFormTranslation, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import SidebarLayout from '../../components/layout/SidebarLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditTranslationsProvider from '../../context/translations/EditTranslationsContext';
import { FormTranslationsContext, useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import ButtonColumn from '../components/ButtonColumn';
import TranslationTable from '../components/TranslationTable';
import { generateAndPopulateTranslationsForForm } from '../utils/editFormTranslationsUtils';

interface Props {
  form: NavFormType;
}

const FormTranslationsPage = ({ form }: Props) => {
  const { storedTranslations, isReady: isTranslationsReady } = useFormTranslations();
  const { storedTranslations: globalTranslations, isReady: isGlobalTranslationsReady } = useGlobalTranslations();
  const rows: FormsApiFormTranslation[] = useMemo(
    () => generateAndPopulateTranslationsForForm(form, storedTranslations, globalTranslations),
    [form, globalTranslations, storedTranslations],
  );

  return (
    <AppLayout navBarProps={{ formMenu: true, formPath: form.path }}>
      <TitleRowLayout>
        <Title>
          {form.properties.skjemanummer}, {form.name}
        </Title>
      </TitleRowLayout>
      <EditTranslationsProvider context={FormTranslationsContext}>
        <RowLayout
          right={
            <SidebarLayout noScroll>
              <ButtonColumn />
            </SidebarLayout>
          }
        >
          <TranslationTable rows={rows} loading={!isTranslationsReady || !isGlobalTranslationsReady} />
        </RowLayout>
      </EditTranslationsProvider>
    </AppLayout>
  );
};
export default FormTranslationsPage;
