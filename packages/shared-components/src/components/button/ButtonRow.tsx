import clsx from 'clsx';
import { ReactNode } from 'react';
import makeStyles from '../../util/styles/jss/jss';

const useStyles = makeStyles({
  error: {
    marginBottom: '1.5rem',
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    gap: 'var(--a-spacing-4)',
    flexWrap: 'wrap',
    marginBottom: 'var(--a-spacing-5)',
    '@media (max-width: var(--a-breakpoint-md-down))': {
      flexDirection: 'column',
    },
    '> button, & a': {
      flexGrow: 1,
      minWidth: '12rem',
      maxWidth: '19.5rem',
      '@media (max-width: var(--a-breakpoint-md-down))': {
        '> button, & a': {
          minWidth: '100%',
          maxWidth: '100%',
        },
      },
    },
  },
  center: {
    justifyContent: 'center',
    '@media (max-width: var(--a-breakpoint-md-down))': {
      justifyContent: 'flex-end',
    },
  },
});

interface Props {
  children: ReactNode;
  center?: boolean;
}

const ButtonRow = ({ children, center = false }: Props) => {
  const styles = useStyles();

  return <div className={clsx(styles.buttonRow, { [styles.center]: center })}>{children}</div>;
};

export default ButtonRow;
