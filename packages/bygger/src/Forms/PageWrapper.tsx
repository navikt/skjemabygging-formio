import { makeStyles } from "@navikt/skjemadigitalisering-shared-components";

const useStyles = makeStyles({
  wrapper: {
    margin: "0 auto",
    padding: "2rem 2rem 0",
  },
});

const PageWrapper = ({ children }) => {
  const styles = useStyles();
  return <div className={styles.wrapper}>{children}</div>;
};

export default PageWrapper;
