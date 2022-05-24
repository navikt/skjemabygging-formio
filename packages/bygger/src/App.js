import makeStyles from "@material-ui/styles/makeStyles";
import "@navikt/ds-css";
import { appStyles, globalStyles } from "@navikt/skjemadigitalisering-shared-components";
import "@navikt/skjemadigitalisering-shared-components/src/overrideFormioStyles.less";
import Formiojs from "formiojs/Formio";
import React, { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import { useAuth } from "./context/auth-context";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { UserAlerterContext, useUserAlerting } from "./userAlerting";

const useStyles = makeStyles(() => ({
  "@global": {
    ".list-inline": {
      listStyle: "none",
      paddingLeft: 0,
    },
    ...globalStyles,
  },
  app: appStyles,
}));

function App({ projectURL, serverURL, pusher }) {
  Formiojs.setBaseUrl(projectURL);
  const styles = useStyles();
  const userAlerter = useUserAlerting(pusher);
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const contentFunc = userData
    ? () => <AuthenticatedApp serverURL={serverURL} formio={formio} />
    : () => <UnauthenticatedApp projectURL={projectURL} />;
  return (
    <UserAlerterContext.Provider value={userAlerter}>
      <section className={styles.app}>{contentFunc()}</section>
    </UserAlerterContext.Provider>
  );
}

export default App;
