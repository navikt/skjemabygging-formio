import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import SidebarLayout from '../../components/layout/SidebarLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditTranslationsProvider from '../../context/translations/EditTranslationsContext';
import { GlobalTranslationsContext, useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import ButtonColumn from '../components/ButtonColumn';
import TranslationTable from '../components/TranslationTable';
import { generateAndPopulateTags } from '../utils/editGlobalTranslationsUtils';

const titles = {
  skjematekster: 'Globale skjematekster',
  grensesnitt: 'Globale grensesnittekster',
  'statiske-tekster': 'Globale statiske tekster',
  validering: 'Globale valideringstekster',
};

const GlobalTranslationsPage = () => {
  const { tag = '' } = useParams();
  const { storedTranslations, isReady } = useGlobalTranslations();

  const translationsPerTag = useMemo(() => generateAndPopulateTags(storedTranslations), [storedTranslations]);
  const rows: FormsApiGlobalTranslation[] | undefined = tag ? translationsPerTag?.[tag] : undefined;

  return (
    <AppLayout navBarProps={{ translationMenu: true }}>
      <TitleRowLayout>
        <Title>{titles[tag]}</Title>
      </TitleRowLayout>
      <EditTranslationsProvider context={GlobalTranslationsContext}>
        <RowLayout
          right={
            <SidebarLayout noScroll={true}>
              <ButtonColumn />
            </SidebarLayout>
          }
        >
          <TranslationTable rows={rows} loading={!isReady} addNewRow={tag === 'skjematekster'} />
        </RowLayout>
      </EditTranslationsProvider>
    </AppLayout>
  );
};

export default GlobalTranslationsPage;
