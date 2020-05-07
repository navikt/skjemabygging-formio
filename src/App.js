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

function App() {
  const path = `http://localhost:3001/forerhund`;
  const formio = new Formiojs(path);

  const [form, setForm] = useState();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (Formiojs.getUser()) {
      setAuthenticated(true);
    }
    formio.loadForm().then(form => setForm(form));
  }, []);

  const onSave = form =>
    formio.saveForm(form).then(changedForm => setForm(changedForm));

  return (
    <Router>
      <Switch>
        <Route exact path="/forerhund">
          {authenticated ? (
            <>
              {form && (
                <FormEdit
                  form={form}
                  options={{
                    src: "http://localhost:3001/forerhund"
                  }}
                  saveForm={onSave}
                  saveText="LAGRE"
                />
              )}
            </>
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route exact path="/">
          <>
            {authenticated ? (
              <Redirect to="/forerhund" />
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
