import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';

const useStyles = makeStyles({
  column: {
    display: 'flex',
    flexDirection: 'column',

    '& > *': {
      marginBottom: '1rem',
    },
  },
});

const Column = ({ children, className = '' }) => {
  const styles = useStyles();
  return (
    <div
      className={classNames(styles.column, {
        [className]: className,
      })}
    >
      {children}
    </div>
  );
};

export default Column;
