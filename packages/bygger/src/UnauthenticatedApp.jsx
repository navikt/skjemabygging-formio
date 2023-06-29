import { makeStyles, NavForm, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { NavBar } from "./components/Navbar/NavBar";
import { useAuth } from "./context/auth-context";
import PageWrapper from "./Forms/PageWrapper.js";

const useStyles = makeStyles({
  navForm: {
    margin: "0 auto",
    maxWidth: "26.25rem",
  },
});

const UnauthenticatedApp = ({ projectURL }) => {
  const { login } = useAuth();
  const { config } = useAppConfig();
  const styles = useStyles();
  return (
    <>
      <NavBar title={"Skjemabygger"} />
      <PageWrapper>
        {config?.isDevelopment ? (
          <NavForm className={styles.navForm} src={`${projectURL}/user/login`} onSubmitDone={(user) => login(user)} />
        ) : (
          <div>Vennligst vent, du logges ut...</div>
        )}
      </PageWrapper>
    </>
  );
};

export default UnauthenticatedApp;
