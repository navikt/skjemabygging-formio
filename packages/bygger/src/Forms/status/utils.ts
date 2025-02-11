import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import moment from 'moment/moment';
import { FormStatusEvents, Status } from './types';

const determineStatus = (formStatusProperties: FormStatusEvents): Status => {
  const { changedAt, publishedAt, isTestForm, unpublished } = formStatusProperties;
  const modifiedDate = moment(changedAt);
  const unpublishedDate = unpublished !== undefined ? moment(unpublished) : undefined;

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
};

const determineStatusFromForm = (form: Form) => {
  const { changedAt, publishedAt, properties } = form;
  const { isTestForm, unpublished } = properties ?? {};
  return determineStatus({ changedAt, publishedAt, isTestForm, unpublished });
};

export { determineStatus, determineStatusFromForm };
