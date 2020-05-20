import React, { useState, useEffect, useMemo } from "react";
import Form from "./react-formio/Form.jsx";
import Formiojs from "formiojs/Formio";
import { Switch, Route, Redirect } from "react-router-dom";
import { Forms } from "./Forms";
import { NavBar } from "./NavBar";

export const useFormio = projectURL => {
  const [forms, setForms] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);

  useEffect(() => {
    if (Formiojs.getUser() && !authenticated) {
      setAuthenticated(true);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated && forms.length === 0) {
      formio.loadForms({ params: { type: "form", tags: "nav-skjema" } }).then(forms => setForms(forms));
    }
  }, [authenticated, forms, formio]);

  const logOut = () => {
    setAuthenticated(false);
    Formiojs.logout();
  };

  const onChangeForm = callbackForm => {
    forms && setForms([...forms.filter(form => form.path !== callbackForm.path), callbackForm]);
  };

  const onSave = callbackForm => {
    formio.saveForm(callbackForm).then(form => {
      onChangeForm(form);
    });
  };

  return { forms, authenticated, setAuthenticated, logOut, onChangeForm, onSave };
};

function App({ projectURL }) {
  const { forms, authenticated, setAuthenticated, logOut, onChangeForm, onSave } = useFormio(projectURL);
  return (
    <Switch>
      <Route path="/forms">
        {authenticated ? (
          <Forms forms={forms} onLogout={logOut} onChange={onChangeForm} onSave={onSave} />
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
              <Form src={`${projectURL}/admin/login`} onSubmitDone={() => setAuthenticated(true)} />
            </>
          )}
        </>
      </Route>
    </Switch>
  );
}

export default App;
