import React from "react";
import PropTypes from "prop-types";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { FormsRouter } from "./Forms";
import { useForms } from "./useForms";
import {AlertContainer} from "./userAlerting";

function AuthenticatedApp({ formio, store}) {
  const { forms, onChangeForm, onSave, onCreate, onDelete, onPublish } = useForms(
    formio,
    store
  );

  const history = useHistory();
  const wrappedCreate = (newForm) => {
    onCreate(newForm).then((savedForm) => {
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
            onPublish={onPublish}
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
};

export default AuthenticatedApp;
