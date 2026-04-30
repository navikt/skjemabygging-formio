import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import clsx from 'clsx';

const useStyles = makeStyles({
  buttonRow: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gridColumn: '2 / 3',

    '& > *:not(:last-child)': {
      marginRight: '1.5rem',
    },
  },
});

const ButtonRow = ({ children, className }) => {
  const styles = useStyles();
  return (
    <ul
      className={clsx(styles.buttonRow, {
        [className]: className,
      })}
    >
      {typeof children.map === 'function' ? (
        children.map((child, index) => <li key={index}>{child}</li>)
      ) : (
        <li>{children}</li>
      )}
    </ul>
  );
};

export default ButtonRow;
