import React from "react";
import { Route, Switch } from "react-router-dom";
import { Components, Formio } from "formiojs";
import { CustomComponents, Template } from "skjemabygging-formio";
import "nav-frontend-typografi-style";
import "formiojs/dist/formio.full.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { styled } from "@material-ui/styles";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";
import { FyllUtRouter, AmplitudeProvider } from "skjemabygging-formio";
import "./overrideFormioStyles.less";

Components.setComponents(CustomComponents);
Formio.use(Template);

function App({ forms, className }) {
  return (
    <div className={className}>
      <Switch>
        <Route exact path="/">
          <AllForms forms={forms} />
        </Route>

        <Route
          path="/:formpath"
          render={(routeProps) => {
            return (
              <FormPageWrapper routeProps={routeProps} forms={forms}>
                {(form) => (
                  <AmplitudeProvider form={form} shouldUseAmplitude={true}>
                    <FyllUtRouter form={form} />
                  </AmplitudeProvider>
                )}
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
