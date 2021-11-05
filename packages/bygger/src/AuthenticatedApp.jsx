import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { FormsRouter } from "./Forms";
import { useFormioForms } from "./hooks/useFormioForms";
import { useFormioTranslations } from "./hooks/useFormioTranslations";
import { UserAlerterContext } from "./userAlerting";
import LoadingComponent from "./components/LoadingComponent";
import TranslationsRouter from "./translations/TranslationsRouter";
import MottaksadresserPage from "./mottaksadresser/MottaksadresserPage";

function AuthenticatedApp({ serverURL, formio, store }) {
  const userAlerter = useContext(UserAlerterContext);
  const { forms, onChangeForm, onSave, onCreate, onDelete, onPublish } = useFormioForms(formio, store, userAlerter);
  const {
    loadGlobalTranslations,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  } = useFormioTranslations(serverURL, formio, userAlerter);

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
          <TranslationsRouter
            forms={forms}
            projectURL={formio.projectUrl}
            loadGlobalTranslations={loadGlobalTranslations}
            publishGlobalTranslations={publishGlobalTranslations}
            loadTranslationsForEditPage={loadTranslationsForEditPage}
            saveGlobalTranslation={saveGlobalTranslation}
            saveLocalTranslation={saveLocalTranslation}
            deleteTranslation={deleteTranslation}
          />
        </Route>
        <Route path="/mottaksadresser">
          <MottaksadresserPage />
        </Route>

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
