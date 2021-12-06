import React, { useContext } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import I18nProvider from "../context/i18n";
import { useFormioForms } from "../hooks/useFormioForms";
import { useFormioTranslations } from "../hooks/useFormioTranslations";
import { UserAlerterContext } from "../userAlerting";
import GlobalTranslationsPage from "./global/GlobalTranslationsPage";
import NewTranslation from "./NewTranslation";
import TranslationsByFormPage from "./TranslationsByFormPage";
import { TranslationsListPage } from "./TranslationsListPage";

const TranslationsRouter = ({ formio, serverURL, onLogout }) => {
  let { path } = useRouteMatch();
  const userAlerter = useContext(UserAlerterContext);
  const { loadForm, loadFormsList } = useFormioForms(formio, userAlerter);
  const {
    loadGlobalTranslations,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  } = useFormioTranslations(serverURL, formio, userAlerter);

  return (
    <Switch>
      <Route exact path={`${path}/`}>
        <TranslationsListPage loadFormsList={loadFormsList} onLogout={onLogout} />
      </Route>
      <Route path={`${path}/new`}>
        <NewTranslation projectURL={formio.projectURL} onLogout={onLogout} />
      </Route>
      <Route
        path={`${path}/global/:languageCode?/:tag?`}
        render={({ match }) => (
          <I18nProvider loadTranslations={loadGlobalTranslations} forGlobal>
            <GlobalTranslationsPage
              {...match.params}
              loadGlobalTranslations={loadGlobalTranslations}
              publishGlobalTranslations={publishGlobalTranslations}
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
