import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import makeStyles from '../../util/styles/jss/jss';

interface Props {
  title?: string;
}

const useStyles = makeStyles({
  icon: {
    verticalAlign: 'sub',
    fontSize: '1.5rem',
    color: 'var(--a-orange-600)',
    margin: '0 var(--a-spacing-1)',
  },
});

const ValidationExclamationIcon = ({ title }: Props) => {
  const styles = useStyles();

  return <ExclamationmarkTriangleFillIcon className={styles.icon} title={title} aria-hidden={!title} />;
};

export default ValidationExclamationIcon;
