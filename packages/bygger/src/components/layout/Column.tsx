import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import clsx from 'clsx';

const useStyles = makeStyles({
  column: {
    display: 'flex',
    flexDirection: 'column',

    '& > *': {
      marginBottom: '0.75rem',
    },
  },
});

/**
 * Remove this when no longer in use
 *
 * @deprecated
 */
const Column = ({ children, className = '' }) => {
  const styles = useStyles();
  return (
    <div
      className={clsx(styles.column, {
        [className]: className,
      })}
    >
      {children}
    </div>
  );
};

export default Column;
