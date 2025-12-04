import '@navikt/ds-css/darkside';
import { makeStyles, Styles } from '@navikt/skjemadigitalisering-shared-components';
import AuthenticatedApp from './AuthenticatedApp';
import UnauthenticatedApp from './UnauthenticatedApp';
import { useAuth } from './context/auth-context';
import FeedbackProvider from './context/notifications/FeedbackContext';
import PusherNotificationsProvider from './context/notifications/NotificationsContext';

const useStyles = makeStyles({
  '@global': {
    '.list-inline': {
      listStyle: 'none',
      paddingLeft: 0,
    },
    ...Styles.global,
    ...Styles.form,
  },
});

function App({ serverURL }) {
  const styles = useStyles();
  const { userData } = useAuth();
  const contentFunc = userData ? () => <AuthenticatedApp serverURL={serverURL} /> : () => <UnauthenticatedApp />;

  return (
    <FeedbackProvider>
      <PusherNotificationsProvider>
        <section className={styles.app}>{contentFunc()}</section>
      </PusherNotificationsProvider>
    </FeedbackProvider>
  );
}

export default App;
