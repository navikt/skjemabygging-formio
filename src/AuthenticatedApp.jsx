import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Formiojs from "formiojs/Formio";
import { Switch, Route, Redirect } from "react-router-dom";
import { Forms } from "./components/Forms";
import { FjompeParent } from "./components/FjompeComp";

export const useFormio = (projectURL, store) => {
  const [forms, setFormsInternal] = useState(store.forms);

  const setForms = useCallback(
    forms => {
      setFormsInternal(forms);
      store.forms = forms;
    },
    [setFormsInternal, store.forms]
  );
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);

  useEffect(() => {
    if (forms.length === 0) {
      formio.loadForms({ params: { type: "form", tags: "nav-skjema" } }).then(forms => setForms(forms));
    }
  }, [forms, setForms, formio]);

  const onChangeForm = form => {
    console.log("App.onChangeForm");
    setForms([...forms.filter(each => each.path !== form.path), form]);
  };

  const onSave = callbackForm => {
    formio.saveForm(callbackForm).then(form => {
      onChangeForm(form);
    });
  };

  return { forms, onChangeForm, onSave };
};

function AuthenticatedApp({ projectURL, store }) {
  const { forms, onChangeForm, onSave } = useFormio(projectURL, store);
  return (
    <>
      <FjompeParent />
      <Switch>
        <Route path="/forms">
          <Forms forms={forms} onChange={onChangeForm} onSave={onSave} />
        </Route>
        <Route path="/">
          <Redirect to="/forms" />
        </Route>
      </Switch>
    </>
  );
}

AuthenticatedApp.propTypes = {
  store: PropTypes.object.isRequired,
  projectURL: PropTypes.string.isRequired
};

export default AuthenticatedApp;
