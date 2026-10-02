import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import styles from './ValidationExclamationIcon.module.css';

interface Props {
  title?: string;
}

const ValidationExclamationIcon = ({ title }: Props) => {
  return (
    <ExclamationmarkTriangleFillIcon className={styles.icon} fontSize="1.5rem" title={title} aria-hidden={!title} />
  );
};

export default ValidationExclamationIcon;
