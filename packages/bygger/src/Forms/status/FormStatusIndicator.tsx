import { useFormStatusIndicatorStyles } from './styles';
import { Status, StreetLightSize } from './types';

const FormStatusIndicator = ({ status, size, title }: { status: Status; size: StreetLightSize; title?: string }) => {
  const styles = useFormStatusIndicatorStyles({ size } as Jss.Theme);
  switch (status) {
    case 'PUBLISHED':
      return <span className={`${styles.streetLight} ${styles.published}`} title={title} aria-hidden={true} />;
    case 'PENDING':
      return <span className={`${styles.streetLight} ${styles.pending}`} title={title} aria-hidden={true} />;
    case 'DRAFT':
      return <span className={`${styles.streetLight} ${styles.draft}`} title={title} aria-hidden={true} />;
    case 'UNPUBLISHED':
      return <span className={`${styles.streetLight} ${styles.unpublished}`} title={title} aria-hidden={true} />;
    case 'TESTFORM':
      return <span className={`${styles.streetLight} ${styles.testform}`} title={title} aria-hidden={true} />;
    case 'UNKNOWN':
    default:
      return <></>;
  }
};

export default FormStatusIndicator;
