import PropTypes from "prop-types";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { FormsRouter } from "./Forms";
import MigrationRouter from "./migration/MigrationRouter";
import MottaksadresserPage from "./mottaksadresser/MottaksadresserPage";
import TranslationsRouter from "./translations/TranslationsRouter";

function AuthenticatedApp({ serverURL, formio }) {
  return (
    <>
      <Switch>
        <Route path="/forms">
          <FormsRouter formio={formio} serverURL={serverURL} />
        </Route>
        <Route path="/translations">
          <TranslationsRouter formio={formio} serverURL={serverURL} />
        </Route>
        <Route path="/mottaksadresser">
          <MottaksadresserPage />
        </Route>
        <Route path="/migrering">
          <MigrationRouter />
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
