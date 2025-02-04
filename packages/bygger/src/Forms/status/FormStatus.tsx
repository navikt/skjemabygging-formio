import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import moment from 'moment';
import FormStatusIndicator from './FormStatusIndicator';
import { useStatusStyles } from './styles';
import { Status, StreetLightSize } from './types';

export function determineStatus(form: Form): Status {
  const { changedAt, publishedAt, properties } = form;
  const { isTestForm, unpublished } = properties ?? {};
  const modifiedDate = moment(changedAt);
  const unpublishedDate = unpublished !== undefined ? moment(unpublished) : undefined;

  // console.log('determineStatus', { changedAt, publishedAt, properties, isTestForm, unpublished });
  // console.log(changedAt, publishedAt, moment(changedAt).isAfter(moment(publishedAt)));
  if (isTestForm) {
    return 'TESTFORM';
  }

  if (changedAt && publishedAt) {
    if (moment(changedAt).isAfter(moment(publishedAt))) {
      return 'PENDING';
    }
    return 'PUBLISHED';
  }

  if (unpublishedDate?.isSameOrAfter(modifiedDate)) {
    return 'UNPUBLISHED';
  } else if (changedAt) {
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
  console.log('FormStatus', status);
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
