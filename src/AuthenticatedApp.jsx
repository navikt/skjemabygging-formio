import React from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { Forms } from "./components/Forms";
import { FjompeParent } from "./components/FjompeComp";
import { useForms } from "./useForms";

function AuthenticatedApp({ formio, store }) {
  const { forms, onChangeForm, onSave, onCreate } = useForms(formio, store);
  const history = useHistory();
  const wrappedCreate = newForm => {
    onCreate(newForm).then(savedForm => {
      history.push(`/forms/${savedForm.path}/edit`);
    });
  };
  return (
    <>
      <FjompeParent />
      <Switch>
        <Route path="/forms">
          <Forms
            forms={forms}
            onChange={onChangeForm}
            onSave={onSave}
            onCreate={wrappedCreate}
            onNew={() => history.push("/forms/new")}
          />
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
  formio: PropTypes.object.isRequired
};

export default AuthenticatedApp;
