import React, { useState } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Components } from "formiojs";
import components from "./custom";
import "nav-frontend-typografi-style";
import "formiojs/dist/formio.full.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FormPage } from "./components/FormPage";
import { styled } from "@material-ui/styles";
import { SummaryPage } from "./components/SummaryPage";
import { PrepareSubmitPage } from "./components/PrepareSubmitPage";
import { AllForms } from "./components/AllForms";
import PropTypes from "prop-types";

Components.setComponents(components);

const FormPageWrapper = ({ routeProps, forms, submissionObject, children }) => {
  const formPath = routeProps.match.params.formpath;
  const targetForm = forms.find((form) => form.path === formPath);

  if (!targetForm) {
    return <h1>Skjemaet {formPath} finnes ikke</h1>;
  }

  if (!submissionObject[targetForm.path]) {
    return <Redirect to={`/${targetForm.path}`} />;
  }

  return children(targetForm, submissionObject[targetForm.path]);
};

function App({ forms, className }) {
  const [submissionObject, setSubmissionObject] = useState({});

  return (
    <div className={className}>
      <Switch>
        <Route exact path="/">
          <AllForms forms={forms} />
        </Route>
        <Route exact path="/:formpath">
          <FormPage forms={forms} setSubmission={setSubmissionObject} submission={submissionObject} />
        </Route>
        <Route
          path="/:formpath/oppsummering"
          render={(routeProps) => {
            return (
              <FormPageWrapper routeProps={routeProps} forms={forms} submissionObject={submissionObject}>
                {(form, submission) => <SummaryPage form={form} submission={submission} />}
              </FormPageWrapper>
            );
          }}
        />
        <Route
          path="/:formpath/forbered-innsending"
          render={(routeProps) => {
            return (
              <FormPageWrapper routeProps={routeProps} forms={forms} submissionObject={submissionObject}>
                {(form, submission) => <PrepareSubmitPage form={form} submission={submission} />}
              </FormPageWrapper>
            );
          }}
        />
      </Switch>
    </div>
  );
}

FormPageWrapper.propTypes = {
  routeProps: PropTypes.object.isRequired,
  forms: PropTypes.array.isRequired,
  submissionObject: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
};

export default styled(App)({
  margin: "0 auto",
  padding: "2rem",
  maxWidth: "800px",
});
