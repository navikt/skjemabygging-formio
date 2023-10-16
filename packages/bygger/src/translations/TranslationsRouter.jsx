import { Route, Routes } from 'react-router-dom';
import { useFormioForms } from '../hooks/useFormioForms';
import { useFormioTranslations } from '../hooks/useFormioTranslations';
import NewTranslation from './NewTranslation';
import { TranslationsByFormRoute } from './TranslationsByFormRoute.tsx';
import { TranslationsListPage } from './TranslationsListPage';
import GlobalTranslationsPage from './global/GlobalTranslationsPage';

const TranslationsRouter = ({ formio, serverURL }) => {
  const { loadForm, loadFormsList } = useFormioForms(formio);
  const {
    loadGlobalTranslationsForTranslationsPage,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  } = useFormioTranslations(serverURL, formio);

  return (
    <Routes>
      <Route path={'/'} element={<TranslationsListPage loadFormsList={loadFormsList} />} />
      <Route path={'/new'} element={<NewTranslation projectURL={formio.projectURL} />} />
      <Route
        path={'/global/:languageCode?/:tag?'}
        element={
          <GlobalTranslationsPage
            loadGlobalTranslations={loadGlobalTranslationsForTranslationsPage}
            publishGlobalTranslations={publishGlobalTranslations}
            deleteTranslation={deleteTranslation}
            saveTranslation={saveGlobalTranslation}
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
