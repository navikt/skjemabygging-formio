import React from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { FormsRouter } from "./Forms";
import { useForms } from "./useForms";

function AuthenticatedApp({ formio, store, flashSuccessMessage }) {
  const { forms, onChangeForm, onSave, onCreate, onDelete } = useForms(formio, store, flashSuccessMessage);

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
          <FormsRouter
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
  formio: PropTypes.object.isRequired,
  flashSuccessMessage: PropTypes.func.isRequired
};

export default AuthenticatedApp;
