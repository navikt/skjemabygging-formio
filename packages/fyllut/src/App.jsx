import { styled } from "@material-ui/styles";
import makeStyles from "@material-ui/styles/makeStyles";
import "@navikt/ds-css";
import { CustomComponents, Styles, Template } from "@navikt/skjemadigitalisering-shared-components";
import { Components, Formio } from "formiojs";
import { Route, Switch } from "react-router-dom";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";

const useStyles = makeStyles(() => ({
  "@global": Styles.global,
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
});
