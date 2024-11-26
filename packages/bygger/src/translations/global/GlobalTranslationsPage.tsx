import { useParams } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import SidebarLayout from '../../components/layout/SidebarLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditTranslationsProvider from '../../context/translations/EditTranslationsContext';
import GlobalTranslationsProvider, {
  GlobalTranslationsContext,
} from '../../context/translations/GlobalTranslationsContext';
import ButtonColumn from '../components/ButtonColumn';
import TranslationTable from '../components/TranslationTable';

const titles = {
  skjematekster: 'Globale skjematekster',
  grensesnitt: 'Globale grensesnittekster',
  'statiske-tekster': 'Globale statiske tekster',
  validering: 'Globale valideringstekster',
};

const GlobalTranslationsPage = () => {
  const { tag = '' } = useParams();

  return (
    <AppLayout navBarProps={{ translationMenu: true }}>
      <TitleRowLayout>
        <Title>{titles[tag]}</Title>
      </TitleRowLayout>
      <GlobalTranslationsProvider>
        <EditTranslationsProvider context={GlobalTranslationsContext}>
          <RowLayout
            right={
              <SidebarLayout noScroll={true}>
                <ButtonColumn />
              </SidebarLayout>
            }
          >
            <TranslationTable />
          </RowLayout>
        </EditTranslationsProvider>
      </GlobalTranslationsProvider>
    </AppLayout>
  );
};

export default GlobalTranslationsPage;
