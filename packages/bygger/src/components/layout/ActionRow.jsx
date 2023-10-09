import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import ButtonRow from './ButtonRow';
import Row from './Row';

const useStyles = makeStyles({
  actionRow: {
    padding: '0 0 2rem',
  },
  centerColumn: {
    gridColumn: '2 / 3',
  },
});

const ActionRow = ({ children }) => {
  const styles = useStyles();
  return (
    <Row className={styles.actionRow}>
      <ButtonRow>{children}</ButtonRow>
    </Row>
  );
};

export default ActionRow;
