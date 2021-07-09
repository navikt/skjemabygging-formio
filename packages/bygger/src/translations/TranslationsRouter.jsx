import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { TranslationsListPage } from "./TranslationsListPage";
import NewTranslation from "./NewTranslation";
import GlobalTranslationsPage from "./global/GlobalTranslationsPage";
import TranslationsByFormPage from "./TranslationsByFormPage";
import I18nProvider from "../context/i18n";

const TranslationsRouter = ({
  deleteTranslation,
  forms,
  loadGlobalTranslations,
  loadTranslationsForEditPage,
  projectURL,
  saveGlobalTranslation,
  saveLocalTranslation,
}) => {
  let { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}/`}>
        <TranslationsListPage forms={forms} />
      </Route>
      <Route path={`${path}/new`}>
        <NewTranslation projectURL={projectURL} />
      </Route>
      <Route
        path={`${path}/global/:languageCode?/:tag?`}
        render={({ match }) => (
          <I18nProvider loadTranslations={loadGlobalTranslations}>
            <GlobalTranslationsPage
              {...match.params}
              loadGlobalTranslations={loadGlobalTranslations}
              projectURL={projectURL}
              deleteTranslation={deleteTranslation}
              saveTranslation={saveGlobalTranslation}
            />
          </I18nProvider>
        )}
      />
      <Route
        path={`${path}/:formPath/:languageCode?`}
        render={({ match }) => {
          const targetForm = forms.find((form) => form.path === match.params.formPath);
          return (
            <I18nProvider loadTranslations={() => loadTranslationsForEditPage(targetForm.path)}>
              <TranslationsByFormPage
                {...match.params}
                form={targetForm}
                projectURL={projectURL}
                deleteTranslation={deleteTranslation}
                saveTranslation={saveLocalTranslation}
              />
            </I18nProvider>
          );
        }}
      />
    </Switch>
  );
};

export default TranslationsRouter;
