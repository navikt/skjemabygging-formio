import React, { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import { UserAlerterContext, useUserAlerting } from "./userAlerting";
import "./components/bootstrapStyle.scss";
import "formiojs/dist/formio.full.min.css";
import makeStyles from "@material-ui/styles/makeStyles";
import { globalStyles, appStyles } from "@navikt/skjemadigitalisering-shared-components";

const useStyles = makeStyles((theme) => ({
  "@global": globalStyles,
  app: {
    "& .list-inline": {
      listStyle: "none",
    },
    ...appStyles,
  },
}));

function App({ projectURL, store, pusher }) {
  const styles = useStyles();
  const userAlerter = useUserAlerting(pusher);
  console.log("userAlerter", userAlerter);
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const contentFunc = userData
    ? () => <AuthenticatedApp formio={formio} store={store} />
    : () => <UnauthenticatedApp projectURL={projectURL} />;
  return (
    <UserAlerterContext.Provider value={userAlerter}>
      <section className={styles.app}>{contentFunc()}</section>
    </UserAlerterContext.Provider>
  );
}

export default App;
