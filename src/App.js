import React, {useState, useEffect, useMemo} from "react";
import Form from "./react-formio/Form.jsx";
import Formiojs from "formiojs/Formio";
import {
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Forms } from "./Forms";

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
        .loadForms({ params: { type: "form", tags: "nav-skjema" } })
        .then(forms => setForms(forms));
    }
  }, [authenticated, forms, formio]);
  return {forms, authenticated, setAuthenticated};
};

function App({projectURL}) {
  const {forms, authenticated, setAuthenticated} = useFormio(projectURL);
  return (
      <Switch>
        <Route path="/forms">
          {authenticated ? (
            <Forms projectURL={projectURL} forms={forms} />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
        <Route path="/">
          <>
            {authenticated ? (
              <Redirect to="/forms" />
            ) : (
              <Form
                src={`${projectURL}/admin/login`}
                onSubmitDone={() => setAuthenticated(true)}
              />
            )}
          </>
        </Route>
      </Switch>
  );
}

export default App;
