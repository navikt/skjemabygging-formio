import classNames from 'classnames';
import makeStyles from '../../../util/styles/jss/jss';

interface Props {
  children: React.ReactNode;
  small?: boolean;
}

const useStyles = makeStyles({
  container: {
    margin: '0 auto',
    maxWidth: '960px',
    padding: 'var(--a-spacing-3) 0 0 0',
    '@media screen and (max-width: 960px)': {
      padding: 'var(--a-spacing-3) var(--a-spacing-4)',
    },
  },
  small: {
    maxWidth: '608px',
  },
});

export function FormContainer({ children, small }: Props) {
  const styles = useStyles();

  return <div className={classNames(styles.container, { [styles.small]: small })}>{children}</div>;
}
