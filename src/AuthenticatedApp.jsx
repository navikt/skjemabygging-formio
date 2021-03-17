import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { FormsRouter } from "./Forms";
import { useForms } from "./useForms";
import { UserAlerterContext } from "./userAlerting";
import NewTranslation from "./translations/NewTranslation";
import { TranslationsListPage } from "./translations/TranslationsListPage";
// import EditTranslationPage from "./translations/EditTranslationPage";
import TranslationsByFormPage from "./translations/TranslationsByFormPage";
import LoadingComponent from "./components/LoadingComponent";
import EditTranslationPage from "./translations/EditTranslationPage";

function AuthenticatedApp({ formio, store }) {
  const userAlerter = useContext(UserAlerterContext);
  const {
    forms,
    onChangeForm,
    onSave,
    onCreate,
    onDelete,
    onPublish,
    loadTranslationsForEditPage,
    loadTranslationsForFormAndMapToI18nObject,
    loadLanguages,
    deleteLanguage,
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
            loadTranslationsForFormAndMapToI18nObject={loadTranslationsForFormAndMapToI18nObject}
          />
        </Route>
        <Route path="/translations">
          <TranslationsListPage projectURL={formio.projectUrl} loadLanguages={loadLanguages} forms={forms} />
        </Route>
        <Route path="/translation/new">
          <NewTranslation projectURL={formio.projectUrl} />
        </Route>
        <Route
          path="/translation/:formPath/:languageCode?"
          render={({ match }) => {
            const targetForm = forms.find((form) => form.path === match.params.formPath);
            return (
              <TranslationsByFormPage
                {...match.params}
                form={targetForm}
                projectURL={formio.projectUrl}
                deleteLanguage={deleteLanguage}
                loadTranslationsForEditPage={loadTranslationsForEditPage}
              />
            );
          }}
        />

        <Route
          path="/globalTranslations/:resourceId"
          render={({ match }) => (
            <EditTranslationPage {...match.params} projectURL={formio.projectUrl} deleteLanguage={deleteLanguage} />
          )}
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
