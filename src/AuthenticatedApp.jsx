import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { FormsRouter } from "./Forms";
import { useForms } from "./hooks/useForms";
import { UserAlerterContext } from "./userAlerting";
import NewTranslation from "./translations/NewTranslation";
import { TranslationsListPage } from "./translations/TranslationsListPage";
import TranslationsByFormPage from "./translations/TranslationsByFormPage";
import LoadingComponent from "./components/LoadingComponent";
import GlobalTranslationsPage from "./translations/global/GlobalTranslationsPage";
import I18nProvider from "./context/i18n";

function AuthenticatedApp({ formio, store }) {
  const userAlerter = useContext(UserAlerterContext);
  const {
    forms,
    onChangeForm,
    onSave,
    onCreate,
    onDelete,
    onPublish,
    loadGlobalTranslations,
    loadTranslationsForEditPage,
    deleteLanguage,
    saveLocalTranslation,
    saveGlobalTranslation,
  } = useForms(formio, store, userAlerter);

  const history = useHistory();
  const wrappedCreate = (newForm) => {
    onCreate(newForm).then((savedForm) => {
      history.push(`/forms/${savedForm.path}/edit`);
    });
  };
  if (!forms) {
    return <LoadingComponent />;
  }
  return (
    <>
      <Switch>
        <Route path="/forms">
          <FormsRouter
            forms={forms}
            onChange={onChangeForm}
            onSave={onSave}
            onCreate={wrappedCreate}
            onDelete={onDelete}
            onPublish={onPublish}
            onNew={() => history.push("/forms/new")}
            loadTranslations={loadTranslationsForEditPage}
          />
        </Route>
        <Route path="/translations">
          <TranslationsListPage forms={forms} />
        </Route>
        <Route path="/translation/new">
          <NewTranslation projectURL={formio.projectUrl} />
        </Route>
        <Route
          path="/translation/global/:languageCode?"
          render={({ match }) => (
            <I18nProvider loadTranslations={loadGlobalTranslations}>
              <GlobalTranslationsPage
                {...match.params}
                loadGlobalTranslations={loadGlobalTranslations}
                projectURL={formio.projectUrl}
                deleteLanguage={deleteLanguage}
                saveTranslation={saveGlobalTranslation}
              />
            </I18nProvider>
          )}
        />
        <Route
          path="/translation/:formPath/:languageCode?"
          render={({ match }) => {
            const targetForm = forms.find((form) => form.path === match.params.formPath);
            return (
              <I18nProvider loadTranslations={() => loadTranslationsForEditPage(targetForm.path)}>
                <TranslationsByFormPage
                  {...match.params}
                  form={targetForm}
                  projectURL={formio.projectUrl}
                  deleteLanguage={deleteLanguage}
                  saveTranslation={saveLocalTranslation}
                  loadTranslationsForEditPage={loadTranslationsForEditPage}
                  userAlerter={userAlerter}
                />
              </I18nProvider>
            );
          }}
        />

        <Route path="/">
          <Redirect to="/forms" />
        </Route>
      </Switch>
    </>
  );
}

AuthenticatedApp.propTypes = {
  store: PropTypes.object.isRequired,
  formio: PropTypes.object.isRequired,
};

export default AuthenticatedApp;
