import clsx from 'clsx';
import FormStatusIndicator from './FormStatusIndicator';
import { useStatusStyles } from './styles';
import { Status, StreetLightSize } from './types';

type FormStatusProps = {
  status: Status;
  size: StreetLightSize;
  iconOnly?: boolean;
};

const FormStatus = ({ status, size, iconOnly = false }: FormStatusProps) => {
  const styles = useStatusStyles({});
  const statusTexts: Record<Status, string> = {
    PUBLISHED: 'Publisert',
    UNPUBLISHED: 'Avpublisert',
    PENDING: 'Upubliserte endringer',
    DRAFT: 'Utkast',
    UNKNOWN: 'Ukjent status',
    TESTFORM: 'Testskjema',
  };
  return (
    <div className={styles.statusRow}>
      <FormStatusIndicator status={status} size={size} title={iconOnly ? statusTexts[status] : undefined} />
      <p className={clsx(styles.rowText, { 'sr-only': iconOnly })}>{statusTexts[status]}</p>
    </div>
  );
};

export default FormStatus;
