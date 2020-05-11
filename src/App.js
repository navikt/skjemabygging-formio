import React, { useState, useEffect } from "react";
import Form from "./react-formio/Form";
import Formiojs from "formiojs/Formio";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { AuthenticatedContent } from "./AuthenticatedContent";

const path = `http://localhost:3001/`;
const formio = new Formiojs(path); //Context-kandidat?

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
        .loadForms({ params: { type: "form" } })
        .then(forms => setForms(forms));
    }
  }, [authenticated, forms]);

  return (
    <Router>
      <Switch>
        <Route path="/forms">
          {authenticated ? (
            <AuthenticatedContent formio={formio} forms={forms} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/">
          <>
            {authenticated ? (
              <Redirect to="/forms" />
            ) : (
              <Form
                src={"http://localhost:3001/user/login"}
                onSubmitDone={() => setAuthenticated(true)}
              />
            )}
          </>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
