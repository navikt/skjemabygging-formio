import {
  Component,
  dateUtils,
  Submission,
  SubmissionIdentity,
  submissionUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  getDatePickerFromDate,
  getDatePickerToDate,
  getMonthPickerMaxYear,
  getMonthPickerMinYear,
} from '../components/date/dateFieldUtils';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from '../context/form-definition/formDefinitionUtils';
import { ValidationRules } from './validators';

interface ValidationDescriptor {
  submissionPath: string;
  field: string;
  rules: ValidationRules;
}

const toRules = (component: Component, pageComponents: Component[], submission?: Submission): ValidationRules => ({
  required: component.validate?.required,
  minLength: typeof component.validate?.minLength === 'number' ? component.validate.minLength : undefined,
  maxLength: typeof component.validate?.maxLength === 'number' ? component.validate.maxLength : undefined,
  email: component.type === 'email' ? true : undefined,
  coverPageValue: component.type === 'firstName' || component.type === 'surname' ? true : undefined,
  numberType:
    component.type === 'number' || component.type === 'currency'
      ? component.inputType === 'numeric'
        ? 'integer'
        : 'decimal'
      : undefined,
  min: typeof component.validate?.min === 'number' ? component.validate.min : undefined,
  max: typeof component.validate?.max === 'number' ? component.validate.max : undefined,
  year: component.type === 'year' ? true : undefined,
  minYear: typeof component.validate?.minYear === 'number' ? component.validate.minYear : undefined,
  maxYear: typeof component.validate?.maxYear === 'number' ? component.validate.maxYear : undefined,
  date: component.type === 'navDatepicker' ? true : undefined,
  fromDate:
    component.type === 'navDatepicker' ? getDatePickerFromDate(component, pageComponents, submission) : undefined,
  toDate: component.type === 'navDatepicker' ? getDatePickerToDate(component) : undefined,
  month: component.type === 'monthPicker' ? true : undefined,
  monthMinYear: component.type === 'monthPicker' ? getMonthPickerMinYear(component) : undefined,
  monthMaxYear: component.type === 'monthPicker' ? getMonthPickerMaxYear(component) : undefined,
  organizationNumber: component.type === 'orgNr' ? true : undefined,
  nationalIdentityNumber: component.type === 'fnrfield' ? true : undefined,
});

const hasRules = (rules: ValidationRules) => Object.values(rules).some((rule) => rule !== undefined && rule !== false);

/**
 * The identity component stores a nested object and shows a "do you have an identity number" radio,
 * then either a national-identity-number field or a birthdate field. It emits its own descriptors so
 * each nested value validates (and focuses from the error summary) like a standalone field.
 */
const collectIdentityDescriptors = (component: Component, submission?: Submission): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const required = component.validate?.required ?? true;
  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as SubmissionIdentity | undefined;

  const descriptors: ValidationDescriptor[] = [
    {
      submissionPath: `${submissionPath}.harDuFodselsnummer`,
      field: component.label ?? TEXTS.statiske.identity.doYouHaveIdentityNumber,
      rules: { required },
    },
  ];

  if (value?.harDuFodselsnummer === 'ja') {
    descriptors.push({
      submissionPath: `${submissionPath}.identitetsnummer`,
      field: TEXTS.statiske.identity.identityNumber,
      rules: { required, nationalIdentityNumber: true },
    });
  } else if (value?.harDuFodselsnummer === 'nei') {
    descriptors.push({
      submissionPath: `${submissionPath}.fodselsdato`,
      field: TEXTS.statiske.identity.yourBirthdate,
      rules: { required, date: true, fromDate: '1900-01-01', toDate: dateUtils.toSubmissionDate() },
    });
  }

  return descriptors;
};

const collectValidationDescriptors = (
  components: Component[],
  submission?: Submission,
  pageComponents: Component[] = components,
): ValidationDescriptor[] =>
  components.flatMap((component) => {
    const rules = toRules(component, pageComponents, submission);
    const submissionPath = getResolvedSubmissionPath(component);

    if (component.type === 'identity') {
      return collectIdentityDescriptors(component, submission);
    }

    if (component.type === 'datagrid') {
      const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
      if (!Array.isArray(rows) || !component.components?.length) {
        return [];
      }

      return rows.flatMap((_, index) =>
        collectValidationDescriptors(
          enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
          submission,
          pageComponents,
        ),
      );
    }

    return [
      ...(hasRules(rules) ? [{ submissionPath, field: component.label ?? component.key, rules }] : []),
      ...collectValidationDescriptors(component.components ?? [], submission, pageComponents),
    ];
  });

/** Builds validation descriptors for the currently visible input components. */
const deriveValidations = (activeComponents: Component[], submission?: Submission): ValidationDescriptor[] => {
  const pathAwareComponents = activeComponents.some((component) => 'baseSubmissionPath' in component)
    ? activeComponents
    : enrichComponentsWithBaseSubmissionPath(activeComponents);

  return collectValidationDescriptors(pathAwareComponents, submission);
};

export { deriveValidations };
export type { ValidationDescriptor };
