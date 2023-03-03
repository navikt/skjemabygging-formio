import makeStyles from "@material-ui/styles/makeStyles";
import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import { appStyles, globalStyles } from "@navikt/skjemadigitalisering-shared-components";
import "@navikt/skjemadigitalisering-shared-components/src/overrideFormioStyles.less";
import Formiojs from "formiojs/Formio";
import React, { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import { useAuth } from "./context/auth-context";
import FeedbackProvider from "./context/notifications/feedbackContext";
import { PusherNotificationsProvider } from "./context/notifications/notificationsContext";
import UnauthenticatedApp from "./UnauthenticatedApp";

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

function App({ projectURL, serverURL }) {
  Formiojs.setBaseUrl(projectURL);
  const styles = useStyles();
  const { userData } = useAuth();
  const formio = useMemo(() => new Formiojs(projectURL), [projectURL]);
  const contentFunc = userData
    ? () => <AuthenticatedApp serverURL={serverURL} formio={formio} />
    : () => <UnauthenticatedApp projectURL={projectURL} />;

  return (
    <FeedbackProvider>
      <PusherNotificationsProvider>
        <section className={styles.app}>{contentFunc()}</section>
      </PusherNotificationsProvider>
    </FeedbackProvider>
  );
}

export default App;
