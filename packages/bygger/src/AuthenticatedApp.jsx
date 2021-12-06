import PropTypes from "prop-types";
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
  const { deleteForm, loadForm, loadFormsList, onSave, onPublish } = useFormioForms(formio, userAlerter);
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
  return (
    <>
      <Switch>
        <Route path="/forms">
          <FormsRouter
            deleteForm={deleteForm}
            formio={formio}
            onSave={onSave}
            onPublish={onPublish}
            onNew={() => history.push("/forms/new")}
            loadForm={loadForm}
            loadFormsList={loadFormsList}
            loadTranslations={loadTranslationsForEditPage}
            onLogout={logout}
          />
        </Route>
        <Route path="/translations">
          <TranslationsRouter
            projectURL={formio.projectUrl}
            loadForm={loadForm}
            loadFormsList={loadFormsList}
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
