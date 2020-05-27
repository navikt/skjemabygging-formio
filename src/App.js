import React from "react";
import PropTypes from 'prop-types';
import Form from "./react-formio/Form.jsx";
import {Redirect, Route, Switch, useHistory} from "react-router-dom";
import {Forms} from "./components/Forms";
import {NavBar} from "./components/NavBar";
import {FjompeParent} from "./components/FjompeComp";
import {useFormio} from "./useFormio";

function App({projectURL, store}) {
  const {forms, authenticated, setAuthenticated, logOut, onChangeForm, onSave, onCreate} = useFormio(projectURL, store);
  const history = useHistory();
  return (
    <>
      <FjompeParent/>
      <Switch>
        <Route path="/forms">
          {authenticated ? (
            <Forms
              forms={forms} onLogout={logOut}
              onChange={onChangeForm} onSave={onSave}
              onCreate={onCreate}
              onNew={() => history.push('/forms/new')}/>
          ) : (
            <Redirect to="/"/>
          )}
        </Route>
        <Route path="/">
          <>
            {authenticated ? (
              <Redirect to="/forms"/>
            ) : (
              <>
                {/*Login-komponent*/}
                <NavBar/>
                <Form src={`${projectURL}/admin/login`} onSubmitDone={() => setAuthenticated(true)}/>
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
