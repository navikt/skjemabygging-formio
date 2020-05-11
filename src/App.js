import React, { useState, useEffect } from "react";
import FormEdit from "./react-formio/FormEdit";
import Form from "./react-formio/Form";
import Formiojs from "formiojs/Formio";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";

function App() {
  const path = `http://localhost:3001/`;
  const formio = new Formiojs(path);

  const [forms, setForms] = useState();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (Formiojs.getUser() && !authenticated) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated && !forms) {
      formio
        .loadForms({ params: { type: "form" } })
        .then(forms => setForms(forms));
    }
  }, [authenticated]);

  const onSave = form => formio.saveForm(form).then(form => console.log(form));

  return (
    <Router>
      <Switch>
        <Route path={"/forms/:formpath"}>
          {forms && (
            <FormEdit
              key={forms[2]._id}
              form={forms[2]}
              options={{
                src: "http://localhost:3001/forerhund"
              }}
              saveForm={onSave}
              saveText="LAGRE"
            />
          )}
        </Route>
        <Route path="/forms">
          {authenticated ? (
            <>
              {forms && (
                <nav>
                  <h3>Velg skjema:</h3>
                  <ul>
                    {forms.map(form => (
                      <li key={form.path}>
                        {console.log(form)}
                        <Link to={"/forms/" + form.path}>{form.title}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
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
