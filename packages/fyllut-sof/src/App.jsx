import React from "react";
import { Route, Switch } from "react-router-dom";
import { Components, Formio } from "formiojs";
import { appStyles, CustomComponents, globalStyles, Template } from "@navikt/skjemadigitalisering-shared-components";
import "nav-frontend-typografi-style";
import { styled } from "@material-ui/styles";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";
import makeStyles from "@material-ui/styles/makeStyles";
import "@navikt/skjemadigitalisering-shared-components/src/overrideFormioStyles.less";
import { FhirContextProvider } from "./components/FhirContext.tsx";

const useStyles = makeStyles((theme) => ({
  "@global": globalStyles,
}));

Components.setComponents(CustomComponents);
Formio.use(Template);

function App({ forms, className }) {
  useStyles();
  return (
    <div className={className}>
      <FhirContextProvider>
        <Switch>
          <Route exact path="/">
            <AllForms forms={forms} />
          </Route>
          <Route path="/:formpath">
            <FormPageWrapper forms={forms} />
          </Route>
        </Switch>
      </FhirContextProvider>
    </div>
  );
}

export default styled(App)({
  margin: "0 auto",
  padding: "2rem",
  maxWidth: "800px",
  ...appStyles,
});
