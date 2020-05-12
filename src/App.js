import React, { useState, useEffect } from "react";
import Form from "./react-formio/Form.jsx";
import Formiojs from "formiojs/Formio";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { AuthenticatedContent } from "./AuthenticatedContent";
import { NavBar } from "./NavBar";

const projectURL =
  process.env.REACT_APP_FORMIO_PROJECT_URL || "https://kxzxmneixaglyxf.form.io";
const formio = new Formiojs(projectURL); //Context-kandidat?

function App() {
  const [forms, setForms] = useState();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (Formiojs.getUser() && !authenticated) {
      setAuthenticated(true);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated && !forms) {
      formio
        .loadForms({ params: { type: "form", tags: "nav-skjema" } })
        .then(forms => setForms(forms));
    }
  }, [authenticated, forms]);

  const onLogout = () => {
    setAuthenticated(false);
    Formiojs.logout();
  };

  return (
    <Router>
      <Switch>
        <Route path="/forms">
          {authenticated ? (
            <AuthenticatedContent formio={formio} forms={forms} onLogout={onLogout} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/">
          <>
            {authenticated ? (
              <Redirect to="/forms" />
            ) : (
              <>
                {/*Login-komponent*/}
                <NavBar />
                <Form
                  src={`${projectURL}/admin/login`}
                  onSubmitDone={() => setAuthenticated(true)}
                />
              </>
            )}
          </>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
