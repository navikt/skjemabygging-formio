import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import makeStyles from '../../util/styles/jss/jss';

interface Props {
  title?: string;
}

const useStyles = makeStyles({
  icon: {
    verticalAlign: 'sub',
    fontSize: '1.5rem',
    color: 'var(--ax-warning-700)',
    margin: '0 var(--ax-space-4)',
  },
});

const ValidationExclamationIcon = ({ title }: Props) => {
  const styles = useStyles();

  return <ExclamationmarkTriangleFillIcon className={styles.icon} title={title} aria-hidden={!title} />;
};

export default ValidationExclamationIcon;
