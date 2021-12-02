import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { useAuth } from "./context/auth-context";
import { FormsRouter } from "./Forms";
import { useFormioForms } from "./hooks/useFormioForms";
import { useFormioTranslations } from "./hooks/useFormioTranslations";
import MottaksadresserPage from "./mottaksadresser/MottaksadresserPage";
import TranslationsRouter from "./translations/TranslationsRouter";
import { UserAlerterContext } from "./userAlerting";

function AuthenticatedApp({ serverURL, formio }) {
  const userAlerter = useContext(UserAlerterContext);
  const { forms, onChangeForm, onSave, onCreate, onDelete, onPublish } = useFormioForms(formio, userAlerter);
  const {
    loadGlobalTranslations,
    publishGlobalTranslations,
    loadTranslationsForEditPage,
    deleteTranslation,
    saveLocalTranslation,
    saveGlobalTranslation,
  } = useFormioTranslations(serverURL, formio, userAlerter);

  const history = useHistory();
  const { logout } = useAuth();
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
            onLogout={logout}
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
            onLogout={logout}
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
  formio: PropTypes.object.isRequired,
};

export default AuthenticatedApp;
