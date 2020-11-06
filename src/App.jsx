import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";
import { Components } from "formiojs";
import components from "./custom";
import "nav-frontend-typografi-style";
import "formiojs/dist/formio.full.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FillInFormPage } from "./components/FillInFormPage";
import { styled } from "@material-ui/styles";
import { SummaryPage } from "./components/SummaryPage";
import { PrepareSubmitPage } from "./components/PrepareSubmitPage";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";

Components.setComponents(components);

function App({ forms, className }) {
  const [submissionObject, setSubmissionObject] = useState({});

  return (
    <div className={className}>
      <Switch>
        <Route exact path="/">
          <AllForms forms={forms} />
        </Route>
        <Route
          exact
          path="/:formpath"
          render={(routeProps) => {
            return (
              <FormPageWrapper routeProps={routeProps} forms={forms} submissionObject={submissionObject}>
                {(form) => (
                  <FillInFormPage form={form} setSubmission={setSubmissionObject} submission={submissionObject} />
                )}
              </FormPageWrapper>
            );
          }}
        />

        <Route
          path="/:formpath/oppsummering"
          render={(routeProps) => {
            return (
              <FormPageWrapper
                routeProps={routeProps}
                forms={forms}
                submissionObject={submissionObject}
                hasSubmission={true}
              >
                {(form, submission) => <SummaryPage form={form} submission={submission} />}
              </FormPageWrapper>
            );
          }}
        />
        <Route
          path="/:formpath/forbered-innsending"
          render={(routeProps) => {
            return (
              <FormPageWrapper
                routeProps={routeProps}
                forms={forms}
                submissionObject={submissionObject}
                hasSubmission={true}
              >
                {(form, submission) => <PrepareSubmitPage form={form} submission={submission} />}
              </FormPageWrapper>
            );
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
