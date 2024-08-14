import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';

const useStyles = makeStyles({
  wrapper: {
    margin: '0 auto',
  },
});

const PageWrapper = ({ children }) => {
  const styles = useStyles();
  return <div className={styles.wrapper}>{children}</div>;
};

export default PageWrapper;
