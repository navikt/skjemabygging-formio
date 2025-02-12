import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormStatusEvents, Status } from './types';

const determineStatus = (formStatusProperties: FormStatusEvents): Status => {
  const { isTestForm, status } = formStatusProperties;

  if (isTestForm) {
    return 'TESTFORM';
  }

  switch (status) {
    case 'draft':
      return 'DRAFT';
    case 'published':
      return 'PUBLISHED';
    case 'pending':
      return 'PENDING';
    case 'unpublished':
      return 'UNPUBLISHED';
    default:
      return 'UNKNOWN';
  }
};

const determineStatusFromForm = (form: Form) => {
  const { changedAt, publishedAt, properties, status } = form;
  const { isTestForm } = properties ?? {};
  return determineStatus({ changedAt, publishedAt, isTestForm, status });
};

export { determineStatus, determineStatusFromForm };
