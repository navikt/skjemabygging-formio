import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import { Components } from "formiojs";
import components from "./custom";
import "nav-frontend-typografi-style";
import "formiojs/dist/formio.full.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FormPage } from "./components/FormPage";
import { styled } from "@material-ui/styles";
import { ResultPage } from "./components/ResultPage";
import { AllForms } from "./components/AllForms";

Components.setComponents(components);

function App({ forms, className }) {
  const [submission, setSubmission] = useState({});
  return (
    <div className={className}>
      <Switch>
        <Route exact path="/">
          <AllForms forms={forms} />
        </Route>
        <Route exact path="/:formpath">
          <FormPage forms={forms} setSubmission={setSubmission} submission={submission} />
        </Route>
        <Route
          path="/:formpath/result"
          render={(routeProps) => {
            const formPath = routeProps.match.params.formpath;
            const form = forms.find((form) => form.path === formPath);
            if (!form) {
              return <h1>Skjemaet {formPath} finnes ikke</h1>;
            }
            return <ResultPage form={form} submission={submission[form.path]} />;
          }}
        />
      </Switch>
    </div>
  );
}

export default styled(App)({
  margin: "0 auto",
  padding: "2rem",
  maxWidth: "800px",
});
