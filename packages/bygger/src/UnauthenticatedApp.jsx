import { makeStyles, NavForm, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { AppLayout } from './components/AppLayout';
import { useAuth } from './context/auth-context';
import PageWrapper from './Forms/PageWrapper';

const useStyles = makeStyles({
  navForm: {
    margin: '0 auto',
    maxWidth: '26.25rem',
  },
});

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  const { config } = useAppConfig();
  const styles = useStyles();
  return (
    <AppLayout>
      <PageWrapper>
        {config?.isDevelopment ? (
          <NavForm
            className={styles.navForm}
            src={`${projectURL}/user/login`}
            events={{
              onSubmitDone: (user) => login(user),
            }}
          />
        ) : (
          <div>Vennligst vent, du logges ut...</div>
        )}
      </PageWrapper>
    </AppLayout>
  );
};

export default UnauthenticatedApp;
