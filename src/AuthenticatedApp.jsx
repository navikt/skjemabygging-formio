import React from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { Forms } from "./components/Forms";
import { useForms } from "./useForms";

function AuthenticatedApp({ formio, store, flashTheMessage }) {
  const { forms, onChangeForm, onSave, onCreate, onDelete } = useForms(formio, store, flashTheMessage);

  const history = useHistory();
  const wrappedCreate = newForm => {
    onCreate(newForm).then(savedForm => {
      history.push(`/forms/${savedForm.path}/edit`);
    });
  };
  return (
    <>
      <Switch>
        <Route path="/forms">
          <Forms
            forms={forms}
            onChange={onChangeForm}
            onSave={onSave}
            onCreate={wrappedCreate}
            onDelete={onDelete}
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
