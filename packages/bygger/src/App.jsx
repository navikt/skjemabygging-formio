import "@navikt/ds-css";
import "@navikt/ds-css-internal";
import { FormioJS, Styles, makeStyles } from "@navikt/skjemadigitalisering-shared-components";
import { useMemo } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";
import { useAuth } from "./context/auth-context";
import FeedbackProvider from "./context/notifications/FeedbackContext";
import PusherNotificationsProvider from "./context/notifications/NotificationsContext";

const useStyles = makeStyles({
  "@global": {
    ".list-inline": {
      listStyle: "none",
      paddingLeft: 0,
    },
    ...Styles.global,
    ...Styles.form,
  },
});

function App({ projectURL, serverURL }) {
  FormioJS.Formio.setBaseUrl(projectURL);
  const styles = useStyles();
  const { userData } = useAuth();
  const formio = useMemo(() => new FormioJS.Formio(projectURL), [projectURL]);
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
