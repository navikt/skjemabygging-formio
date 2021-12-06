import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import I18nProvider from "../context/i18n";
import GlobalTranslationsPage from "./global/GlobalTranslationsPage";
import NewTranslation from "./NewTranslation";
import TranslationsByFormPage from "./TranslationsByFormPage";
import { TranslationsListPage } from "./TranslationsListPage";

const TranslationsRouter = ({
  deleteTranslation,
  loadForm,
  loadFormsList,
  loadGlobalTranslations,
  publishGlobalTranslations,
  loadTranslationsForEditPage,
  projectURL,
  saveGlobalTranslation,
  saveLocalTranslation,
  onLogout,
}) => {
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/`}>
        <TranslationsListPage loadFormsList={loadFormsList} onLogout={onLogout} />
      </Route>
      <Route path={`${path}/new`}>
        <NewTranslation projectURL={projectURL} onLogout={onLogout} />
      </Route>
      <Route
        path={`${path}/global/:languageCode?/:tag?`}
        render={({ match }) => (
          <I18nProvider loadTranslations={loadGlobalTranslations} forGlobal>
            <GlobalTranslationsPage
              {...match.params}
              loadGlobalTranslations={loadGlobalTranslations}
              publishGlobalTranslations={publishGlobalTranslations}
              projectURL={projectURL}
              deleteTranslation={deleteTranslation}
              saveTranslation={saveGlobalTranslation}
              onLogout={onLogout}
            />
          </I18nProvider>
        )}
      />
      <Route
        path={`${path}/:formPath/:languageCode?`}
        render={({ match }) => (
          <I18nProvider loadTranslations={() => loadTranslationsForEditPage(match.params.formPath)}>
            <TranslationsByFormPage
              loadForm={loadForm}
              projectURL={projectURL}
              deleteTranslation={deleteTranslation}
              saveTranslation={saveLocalTranslation}
              onLogout={onLogout}
            />
          </I18nProvider>
        )}
      />
    </Switch>
  );
};

export default TranslationsRouter;
