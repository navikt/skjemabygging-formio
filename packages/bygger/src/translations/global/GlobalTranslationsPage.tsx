import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useParams } from 'react-router';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import SidebarLayout from '../../components/layout/SidebarLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import EditGlobalTranslationsProvider from '../../context/translations/EditGlobalTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import UnusedTranslations from '../components/UnusedTranslations';
import GlobalTranslationButtonsColumn from './GlobalTranslationButtonsColumn';
import GlobalTranslationsTable from './GlobalTranslationsTable';

const titles = {
  introPage: 'Introside',
  skjematekster: 'Globale skjematekster',
  grensesnitt: 'Globale grensesnittekster',
  'statiske-tekster': 'Globale statiske tekster',
  validering: 'Globale valideringstekster',
};

const GlobalTranslationsPage = () => {
  const { tag = 'skjematekster' } = useParams();
  const { translationsPerTag, isReady, storedTranslations, deleteTranslation } = useGlobalTranslations();

  const translations: FormsApiTranslation[] | undefined = translationsPerTag?.[tag];

  const initialChanges = useMemo(() => {
    if (isReady) {
      const translationsWithInitValues = translationsPerTag['introPage'];
      return Object.values(translationsWithInitValues).filter((translation) => {
        return !Object.keys(storedTranslations)?.includes(translation.key);
      });
    }
  }, [isReady, storedTranslations, translationsPerTag]);

  const unusedTranslations = useMemo(() => {
    if (translations) {
      return Object.values(storedTranslations).filter(
        (storedTranslation) =>
          storedTranslation.tag === tag &&
          !translations.some((translation) => translation.key === storedTranslation.key),
      );
    }
  }, [storedTranslations, tag, translations]);

  return (
    <AppLayout navBarProps={{ translationMenu: true }}>
      <TitleRowLayout>
        <Title>{titles[tag]}</Title>
      </TitleRowLayout>
      <EditGlobalTranslationsProvider initialChanges={initialChanges}>
        <form onSubmit={(event) => event.preventDefault()}>
          <RowLayout
            right={
              <SidebarLayout noScroll={true}>
                <GlobalTranslationButtonsColumn />
              </SidebarLayout>
            }
          >
            {tag !== 'skjematekster' && (
              <UnusedTranslations
                translations={unusedTranslations}
                onRemove={deleteTranslation}
                showKeys={tag === 'validering' || tag === 'introPage'}
              />
            )}
            <GlobalTranslationsTable
              translations={translations}
              isKeyBased={tag === 'introPage'}
              addNewRow={tag === 'skjematekster'}
              loading={!isReady}
            />
          </RowLayout>
        </form>
      </EditGlobalTranslationsProvider>
    </AppLayout>
  );
};

export default GlobalTranslationsPage;
