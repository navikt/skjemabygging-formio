import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormStatusProperties, Status } from './types';

const determineStatus = (formElement: FormStatusProperties): Status => {
  const { properties, status } = formElement;

  if (properties?.isTestForm) {
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
  return determineStatus({ changedAt, publishedAt, properties, status });
};

export { determineStatus, determineStatusFromForm };
