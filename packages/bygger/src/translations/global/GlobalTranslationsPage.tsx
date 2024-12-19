import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import SidebarLayout from '../../components/layout/SidebarLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditGlobalTranslationsProvider, {
  EditGlobalTranslationsContext,
} from '../../context/translations/EditGlobalTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import TranslationButtonColumn from '../components/TranslationButtonColumn';
import TranslationTable from '../components/TranslationTable';
import { generateAndPopulateTags } from '../utils/editGlobalTranslationsUtils';

const titles = {
  skjematekster: 'Globale skjematekster',
  grensesnitt: 'Globale grensesnittekster',
  'statiske-tekster': 'Globale statiske tekster',
  validering: 'Globale valideringstekster',
};

const GlobalTranslationsPage = () => {
  const { tag = 'skjematekster' } = useParams();
  const { storedTranslations, isReady } = useGlobalTranslations();

  const translationsPerTag = useMemo(() => generateAndPopulateTags(storedTranslations), [storedTranslations]);
  const rows: FormsApiGlobalTranslation[] | undefined = translationsPerTag?.[tag];

  return (
    <AppLayout navBarProps={{ translationMenu: true }}>
      <TitleRowLayout>
        <Title>{titles[tag]}</Title>
      </TitleRowLayout>
      <EditGlobalTranslationsProvider>
        <RowLayout
          right={
            <SidebarLayout noScroll={true}>
              <TranslationButtonColumn editContext={EditGlobalTranslationsContext} />
            </SidebarLayout>
          }
        >
          <TranslationTable
            rows={rows}
            loading={!isReady}
            addNewRow={tag === 'skjematekster'}
            editContext={EditGlobalTranslationsContext}
          />
        </RowLayout>
      </EditGlobalTranslationsProvider>
    </AppLayout>
  );
};

export default GlobalTranslationsPage;
