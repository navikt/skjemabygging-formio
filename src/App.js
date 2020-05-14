import React, {useState, useEffect, useMemo} from "react";
import Form from "./react-formio/Form.jsx";
import Formiojs from "formiojs/Formio";
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import {Forms} from "./Forms";
import {NavBar} from "./NavBar";

export const useFormio = (projectURL) => {
  const [forms, setForms] = useState();
  const [authenticated, setAuthenticated] = useState(false);
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);

  useEffect(() => {
    if (Formiojs.getUser() && !authenticated) {
      setAuthenticated(true);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated && !forms) {
      formio
        .loadForms({params: {type: "form", tags: "nav-skjema"}})
        .then(forms => setForms(forms));
    }
  }, [authenticated, forms, formio]);

  const logOut = () => {
    setAuthenticated(false);
    Formiojs.logout();
  }
  return {forms, authenticated, setAuthenticated, logOut};
};

function App({projectURL}) {
  const {forms, authenticated, setAuthenticated, saveForm, logOut} = useFormio(projectURL);
  return (
    <Switch>
      <Route path="/forms">
        {authenticated ? (
          <Forms projectURL={projectURL} forms={forms} onLogout={logOut} onSaveForm={saveForm}/>
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
              <Form
                src={`${projectURL}/admin/login`}
                onSubmitDone={() => setAuthenticated(true)}
              />
            </>
          )}
        </>
      </Route>
    </Switch>
  );
}

export default App;
