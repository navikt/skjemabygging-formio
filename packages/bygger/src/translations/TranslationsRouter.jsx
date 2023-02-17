import React, { useContext } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { useFormioForms } from "../hooks/useFormioForms";
import { useFormioTranslations } from "../hooks/useFormioTranslations";
import { UserAlerterContext } from "../userAlerting";
import GlobalTranslationsPage from "./global/GlobalTranslationsPage";
import NewTranslation from "./NewTranslation";
import { TranslationsByFormRoute } from "./TranslationsByFormRoute.tsx";
import { TranslationsListPage } from "./TranslationsListPage";

const TranslationsRouter = ({ formio, serverURL }) => {
  let { path } = useRouteMatch();
  const userAlerter = useContext(UserAlerterContext);
  const { loadForm, loadFormsList } = useFormioForms(formio, userAlerter);
  const {
    loadGlobalTranslationsForTranslationsPage,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  } = useFormioTranslations(serverURL, formio, userAlerter);

  return (
    <Switch>
      <Route exact path={`${path}/`}>
        <TranslationsListPage loadFormsList={loadFormsList} />
      </Route>
      <Route path={`${path}/new`}>
        <NewTranslation projectURL={formio.projectURL} />
      </Route>
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
    </Switch>
  );
};

export default TranslationsRouter;
