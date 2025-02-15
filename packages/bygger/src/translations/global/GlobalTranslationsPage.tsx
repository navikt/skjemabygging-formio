import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
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
import TranslationTable from '../components/TranslationTable';
import GlobalTranslationButtonsColumn from './GlobalTranslationButtonsColumn';

const titles = {
  skjematekster: 'Globale skjematekster',
  grensesnitt: 'Globale grensesnittekster',
  'statiske-tekster': 'Globale statiske tekster',
  validering: 'Globale valideringstekster',
};

const GlobalTranslationsPage = () => {
  const { tag = 'skjematekster' } = useParams();
  const { translationsPerTag, isReady } = useGlobalTranslations();

  const rows: FormsApiGlobalTranslation[] | undefined = translationsPerTag?.[tag];

  return (
    <AppLayout navBarProps={{ translationMenu: true }}>
      <TitleRowLayout>
        <Title>{titles[tag]}</Title>
      </TitleRowLayout>
      <EditGlobalTranslationsProvider>
        <form>
          <RowLayout
            right={
              <SidebarLayout noScroll={true}>
                <GlobalTranslationButtonsColumn />
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
        </form>
      </EditGlobalTranslationsProvider>
    </AppLayout>
  );
};

export default GlobalTranslationsPage;
