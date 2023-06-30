import { makeStyles, NavForm } from "@navikt/skjemadigitalisering-shared-components";
import { AppLayout } from "../components/AppLayout";
import PageWrapper from "../Forms/PageWrapper";

const useStyles = makeStyles({
  form: {
    margin: "0 auto",
    maxWidth: "26.25rem",
  },
});

const NewTranslation = ({ projectURL }) => {
  const styles = useStyles();

  return (
    <AppLayout
      navBarProps={{
        title: "Oversettelser",
        visOversettelseliste: true,
        visLagNyttSkjema: false,
      }}
    >
      <PageWrapper>
        <NavForm className={styles.form} src={`${projectURL}/language`} />
      </PageWrapper>
    </AppLayout>
  );
};

export default NewTranslation;
