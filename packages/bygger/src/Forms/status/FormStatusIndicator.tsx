import { useFormStatusIndicatorStyles } from './styles';
import { Status, StreetLightSize } from './types';

const FormStatusIndicator = ({ status, size, title }: { status: Status; size: StreetLightSize; title?: string }) => {
  // @ts-ignore
  const styles = useFormStatusIndicatorStyles({ size });
  switch (status) {
    case 'PUBLISHED':
      return <span className={`${styles.streetLight} ${styles.published}`} title={title} />;
    case 'PENDING':
      return <span className={`${styles.streetLight} ${styles.pending}`} title={title} />;
    case 'DRAFT':
      return <span className={`${styles.streetLight} ${styles.draft}`} title={title} />;
    case 'UNPUBLISHED':
      return <span className={`${styles.streetLight} ${styles.unpublished}`} title={title} />;
    case 'TESTFORM':
      return <span className={`${styles.streetLight} ${styles.testform}`} title={title} />;
    case 'UNKNOWN':
    default:
      return <></>;
  }
};

export default FormStatusIndicator;
