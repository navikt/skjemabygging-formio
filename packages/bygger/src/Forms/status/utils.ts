import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormMigrationLogData } from '../../../types/migration';
import { FormStatusEvents, Status } from './types';

const getStatusProperties = (formElement: Form | FormMigrationLogData | FormStatusEvents): FormStatusEvents => {
  let isTestForm;
  if ('properties' in formElement) {
    const { properties } = formElement as Form;
    isTestForm = properties?.isTestForm;
  }
  if ('isTestForm' in formElement) {
    isTestForm = formElement.isTestForm;
  }
  const { status } = formElement;

  return { status, isTestForm };
};

const determineStatus = (formElement: FormStatusEvents | Form | FormMigrationLogData): Status => {
  const { isTestForm, status } = getStatusProperties(formElement);

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
