import React from "react";
import { Route, Switch } from "react-router-dom";
import { Components, Formio } from "formiojs";
import {
  CustomComponents,
  Template,
  FyllUtRouter,
  AmplitudeProvider,
  globalStyles,
  appStyles,
} from "@navikt/skjemadigitalisering-shared-components";
import "nav-frontend-typografi-style";
import "formiojs/dist/formio.full.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { styled } from "@material-ui/styles";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";
import makeStyles from "@material-ui/styles/makeStyles";
import "@navikt/skjemadigitalisering-shared-components/src/overrideFormioStyles.less";

const useStyles = makeStyles((theme) => ({
  "@global": globalStyles,
}));

Components.setComponents(CustomComponents);
Formio.use(Template);

function App({ forms, className }) {
  useStyles();
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
  ...appStyles,
});
