import PropTypes from "prop-types";
import React from "react";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { useAuth } from "./context/auth-context";
import { FormsRouter } from "./Forms";
import MottaksadresserPage from "./mottaksadresser/MottaksadresserPage";
import TranslationsRouter from "./translations/TranslationsRouter";

function AuthenticatedApp({ serverURL, formio }) {
  const history = useHistory();
  const { logout } = useAuth();
  return (
    <>
      <Switch>
        <Route path="/forms">
          <FormsRouter
            formio={formio}
            onNew={() => history.push("/forms/new")}
            onLogout={logout}
            serverURL={serverURL}
          />
        </Route>
        <Route path="/translations">
          <TranslationsRouter formio={formio} onLogout={logout} serverURL={serverURL} />
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
