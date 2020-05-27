import React from "react";
import PropTypes from "prop-types";
import {Switch, Route, Redirect, useHistory} from "react-router-dom";
import { Forms } from "./components/Forms";
import { FjompeParent } from "./components/FjompeComp";
import { useFormio } from "./useFormio";

function AuthenticatedApp({ projectURL, store }) {
  const {forms, onChangeForm, onSave, onCreate} = useFormio(projectURL, store);
  const history = useHistory();
  return (
    <>
      <FjompeParent />
      <Switch>
        <Route path="/forms">
          <Forms
            forms={forms}
            onChange={onChangeForm} onSave={onSave}
            onCreate={onCreate}
            onNew={() => history.push('/forms/new')}/>
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
