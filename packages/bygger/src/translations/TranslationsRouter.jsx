import { Route, Routes } from 'react-router-dom';
import { useFormioForms } from '../api/useFormioForms';
import { useFormioTranslations } from '../api/useFormioTranslations';
import NewTranslation from './NewTranslation';
import { TranslationsByFormRoute } from './TranslationsByFormRoute.tsx';
import GlobalTranslationsPage from './global/GlobalTranslationsPage';

const TranslationsRouter = ({ formio, serverURL }) => {
  const { loadForm } = useFormioForms();
  const {
    loadGlobalTranslationsForTranslationsPage,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
    importFromProduction,
  } = useFormioTranslations(serverURL, formio);

  return (
    <Routes>
      <Route path={'/new'} element={<NewTranslation projectURL={formio.projectURL} />} />
      <Route
        path={'/global/:languageCode?/:tag?'}
        element={
          <GlobalTranslationsPage
            loadGlobalTranslations={loadGlobalTranslationsForTranslationsPage}
            publishGlobalTranslations={publishGlobalTranslations}
            deleteTranslation={deleteTranslation}
            saveTranslation={saveGlobalTranslation}
            importFromProduction={importFromProduction}
          />
        }
      />
      <Route
        path={'/:formPath/:languageCode?'}
        element={
          <TranslationsByFormRoute
            loadTranslationsForEditPage={loadTranslationsForEditPage}
            saveLocalTranslation={saveLocalTranslation}
            loadForm={loadForm}
          />
        }
      />
    </Routes>
  );
};

export default TranslationsRouter;
