import classNames from 'classnames';
import moment from 'moment';
import FormStatusIndicator from './FormStatusIndicator';
import { useStatusStyles } from './styles';
import { PublishStatusProperties, Status, StreetLightSize } from './types';

export function determineStatus(publishProperties: PublishStatusProperties): Status {
  const { modified, published, isTestForm, unpublished } = publishProperties;
  const modifiedDate = moment(modified);
  const unpublishedDate = unpublished !== undefined ? moment(unpublished) : undefined;

  if (isTestForm) {
    return 'TESTFORM';
  }

  if (modified && published) {
    if (moment(modified).isAfter(moment(published))) {
      return 'PENDING';
    }
    return 'PUBLISHED';
  }

  if (unpublishedDate?.isSameOrAfter(modifiedDate)) {
    return 'UNPUBLISHED';
  } else if (modified) {
    return 'DRAFT';
  }

  return 'UNKNOWN';
}

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
      <p className={classNames(styles.rowText, { 'sr-only': iconOnly })}>{statusTexts[status]}</p>
    </div>
  );
};

export default FormStatus;
