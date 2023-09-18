import "@navikt/ds-css";
import { makeStyles, Styles } from "@navikt/skjemadigitalisering-shared-components";
import classNames from "classnames";
import { Route, Switch } from "react-router-dom";
import { AllForms } from "./components/AllForms";
import { FormPageWrapper } from "./components/FormPageWrapper";

const useStyles = makeStyles({
  "@global": Styles.global,
  app: {
    margin: "0 auto",
  },
});

function App({ className }) {
  const styles = useStyles();
  return (
    <main className={classNames(className, styles.app, "cool")}>
      <Switch>
        <Route exact path="/">
          <AllForms />
        </Route>
        <Route path="/:formPath">
          <FormPageWrapper />
        </Route>
      </Switch>
    </main>
  );
}

export default App;
