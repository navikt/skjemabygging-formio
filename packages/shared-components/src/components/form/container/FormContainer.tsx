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
    padding: '2rem 0 0 0',
    '@media screen and (max-width: 960px)': {
      padding: '1rem',
    },
  },
  small: {
    maxWidth: '640px',
  },
});

export function FormContainer({ children, small }: Props) {
  const styles = useStyles();

  return <div className={classNames(styles.container, { [styles.small]: small })}>{children}</div>;
}
