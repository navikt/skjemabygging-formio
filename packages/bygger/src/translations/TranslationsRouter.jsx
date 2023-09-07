import { Route, Routes, useRouteMatch } from "react-router-dom";
import { useFormioForms } from "../hooks/useFormioForms";
import { useFormioTranslations } from "../hooks/useFormioTranslations";
import NewTranslation from "./NewTranslation";
import { TranslationsByFormRoute } from "./TranslationsByFormRoute.tsx";
import { TranslationsListPage } from "./TranslationsListPage";
import GlobalTranslationsPage from "./global/GlobalTranslationsPage";

const TranslationsRouter = ({ formio, serverURL }) => {
  let { path } = useRouteMatch();
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
      <Route exact path={`${path}/`} element={<TranslationsListPage loadFormsList={loadFormsList} />} />
      <Route path={`${path}/new`} element={<NewTranslation projectURL={formio.projectURL} />} />
      <Route
        path={`${path}/global/:languageCode?/:tag?`}
        render={({ match }) => (
          <GlobalTranslationsPage
            {...match.params}
            loadGlobalTranslations={loadGlobalTranslationsForTranslationsPage}
            publishGlobalTranslations={publishGlobalTranslations}
            deleteTranslation={deleteTranslation}
            saveTranslation={saveGlobalTranslation}
          />
        )}
      />
      <Route
        path={`${path}/:formPath/:languageCode?`}
        render={({ match }) => (
          <TranslationsByFormRoute
            formPath={match.params.formPath}
            loadTranslationsForEditPage={loadTranslationsForEditPage}
            saveLocalTranslation={saveLocalTranslation}
            loadForm={loadForm}
          />
        )}
      />
    </Routes>
  );
};

export default TranslationsRouter;
