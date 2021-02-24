import React, { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import Formiojs from "formiojs/Formio";
import { UserAlerterContext, useUserAlerting } from "./userAlerting";
import "./overrideFormioStyles.less";
import makeStyles from "@material-ui/styles/makeStyles";
import navGlobalStyles from "./components/navGlobalStyles";

const useStyles = makeStyles((theme) => ({
  "@global": navGlobalStyles,
  app: {
    "& .wizard-page": {
      borderRadius: "0.25rem",
      background: "#fff",
      padding: "1rem",
      margin: "1rem 0 1rem 0",
    },
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
