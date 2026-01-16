import makeStyles from '../../../util/styles/jss/jss';

interface Props {
  children: React.ReactNode;
}

const useStyles = makeStyles({
  container: {
    margin: '0 auto',
    maxWidth: '640px',
    padding: 'var(--ax-space-16) 0 0 0',
    '@media screen and (max-width: 640px)': {
      padding: 'var(--ax-space-12) var(--ax-space-16)',
    },
  },
});

export function FormContainer({ children }: Props) {
  const styles = useStyles();

  return <div className={styles.container}>{children}</div>;
}
