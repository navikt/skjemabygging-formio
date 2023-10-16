import { useFormStatusIndicatorStyles } from './styles';
import { Status, StreetLightSize } from './types';

const FormStatusIndicator = ({ status, size }: { status: Status; size: StreetLightSize }) => {
  // @ts-ignore
  const styles = useFormStatusIndicatorStyles({ size });
  switch (status) {
    case 'PUBLISHED':
      return <span className={`${styles.streetLight} ${styles.published}`} />;
    case 'PENDING':
      return <span className={`${styles.streetLight} ${styles.pending}`} />;
    case 'DRAFT':
      return <span className={`${styles.streetLight} ${styles.draft}`} />;
    case 'UNPUBLISHED':
      return <span className={`${styles.streetLight} ${styles.unpublished}`} />;
    case 'TESTFORM':
      return <span className={`${styles.streetLight} ${styles.testform}`} />;
    case 'UNKNOWN':
    default:
      return <></>;
  }
};

export default FormStatusIndicator;
