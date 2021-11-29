import { styled } from "@material-ui/styles";
import makeStyles from "@material-ui/styles/makeStyles";
import { appStyles, CustomComponents, globalStyles, Template } from "@navikt/skjemadigitalisering-shared-components";
import "@navikt/skjemadigitalisering-shared-components/src/overrideFormioStyles.less";
import { Components, Formio } from "formiojs";
import "nav-frontend-typografi-style";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";

const useStyles = makeStyles((theme) => ({
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
        <Route path="/:formpath" render={(routeProps) => <FormPageWrapper routeProps={routeProps} />} />
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
