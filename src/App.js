import React, {useState, useEffect, useMemo, useCallback} from "react";
import PropTypes from 'prop-types';
import Form from "./react-formio/Form.jsx";
import Formiojs from "formiojs/Formio";
import { Switch, Route, Redirect } from "react-router-dom";
import { Forms } from "./components/Forms";
import { NavBar } from "./components/NavBar";
import {FjompeParent} from "./components/FjompeComp";

export const useFormio = (projectURL, store) => {
  const [forms, setFormsInternal] = useState(store.forms);
  const setForms = useCallback((forms) => {
    setFormsInternal(forms);
    store.forms = forms;
  }, [setFormsInternal, store.forms]);
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
  }, [authenticated, forms, setForms, formio]);

  const logOut = () => {
    setAuthenticated(false);
    Formiojs.logout();
  };

  const onChangeForm = form => {
    console.log('App.onChangeForm');
    setForms([...forms.filter(each => each.path !== form.path), form]);
  };

  const onSave = callbackForm => {
    formio.saveForm(callbackForm).then(form => {
      onChangeForm(form);
    });
  };

  return { forms, authenticated, setAuthenticated, logOut, onChangeForm, onSave };
};

function App({ projectURL, store }) {
  const { forms, authenticated, setAuthenticated, logOut, onChangeForm, onSave } = useFormio(projectURL, store);
  return (
    <>
      <FjompeParent />
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
      </>
  );
}

App.propTypes = {
  store: PropTypes.object.isRequired,
  projectURL: PropTypes.string.isRequired
}

export default App;
