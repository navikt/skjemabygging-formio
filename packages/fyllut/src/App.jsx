import "@navikt/ds-css";
import { CustomComponents, makeStyles, Styles, Template } from "@navikt/skjemadigitalisering-shared-components";
import classNames from "classnames";
import { Components, Formio } from "formiojs";
import { Route, Switch } from "react-router-dom";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";

const useStyles = makeStyles({
  "@global": Styles.global,
  app: {
    margin: "0 auto",
  },
});

Components.setComponents(CustomComponents);
Formio.use(Template);

function App({ className }) {
  const styles = useStyles();
  return (
    <div className={classNames(className, styles.app, "cool")}>
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

export default App;
