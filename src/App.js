import React, { useState, useEffect } from "react";
import FormEdit from "./react-formio/FormEdit";
import Form from "./react-formio/Form";
import Formiojs from "formiojs/Formio";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import FormEditorPage from "./FormEditorPage";

// const formPath = 'nav100750soknadomforerhund';
const formPath = 'debug';

function App({projectURL}) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (Formiojs.getUser()) {
      setAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Switch>
        <Route exact path={`/${formPath}`}>
          {authenticated ? (
            <FormEditorPage
               src={`${projectURL}/${formPath}`}

                />)
              : (
            <Redirect to="/" />
          )}
        </Route>
        <Route exact path="/">
          <>
            {authenticated ? (
              <Redirect to={`/${formPath}`} />
            ) : (
              <Form
                src={`${projectURL}/admin/login`}
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
