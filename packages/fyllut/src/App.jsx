import { styled } from "@material-ui/styles";
import makeStyles from "@material-ui/styles/makeStyles";
import "@navikt/ds-css";
import { appStyles, CustomComponents, globalStyles, Template } from "@navikt/skjemadigitalisering-shared-components";
import "@navikt/skjemadigitalisering-shared-components/src/overrideFormioStyles.less";
import { Components, Formio } from "formiojs";
import "nav-frontend-typografi-style";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";

const useStyles = makeStyles(() => ({
  "@global": globalStyles,
}));

Components.setComponents(CustomComponents);
Formio.use(Template);

function App({ className }) {
  useStyles();
  return (
    <div className={className}>
      <Switch>
        <Route exact path="/">
          <AllForms />
        </Route>
        <Route path="/:formPath">
          <FormPageWrapper />
        </Route>
      </Switch>
    </div>
  );
}

export default styled(App)({
  margin: "0 auto",
  ...appStyles,
});
