import {
  checkCondition,
  Component,
  dataFetcherUtils,
  dateUtils,
  DrivingListSubmission,
  Submission,
  SubmissionAddress,
  SubmissionIdentity,
  SubmissionMethod,
  submissionUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { resolveAddressType, shouldShowAddressTypeChoice } from '../components/address/addressUtils';
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
import { getRenderedDataGridRows } from '../fyllut/form-components/components/data-grid/dataGridRows';
import { ValidationRules } from './validators';

interface ValidationDescriptor {
  submissionPath: string;
  field: string;
  rules: ValidationRules;
  component?: Component;
}

const isRedundantLegacyCustomValidation = (component: Component) =>
  (component.type === 'bankAccount' &&
    component.validate?.custom === 'valid = instance.validateAccountNumber(input)') ||
  (component.type === 'orgNr' && component.validate?.custom === 'valid = instance.validateOrganizationNumber(input)');

const toRules = (
  component: Component,
  pageComponents: Component[],
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
): ValidationRules => ({
  required: component.validate?.required,
  ...(component.validate?.onlyAvailableItems
    ? { onlyAvailableItems: (component.values ?? component.data?.values ?? []).map(({ value }) => value) }
    : {}),
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
  digitsOnly: component.validate?.digitsOnly,
  date: component.type === 'navDatepicker' ? true : undefined,
  fromDate:
    component.type === 'navDatepicker' ? getDatePickerFromDate(component, pageComponents, submission) : undefined,
  toDate: component.type === 'navDatepicker' ? getDatePickerToDate(component) : undefined,
  month: component.type === 'monthPicker' ? true : undefined,
  monthMinYear: component.type === 'monthPicker' ? getMonthPickerMinYear(component) : undefined,
  monthMaxYear: component.type === 'monthPicker' ? getMonthPickerMaxYear(component) : undefined,
  organizationNumber: component.type === 'orgNr' ? true : undefined,
  nationalIdentityNumber: component.type === 'fnrfield' ? true : undefined,
  ...(component.type === 'bankAccount' ? { accountNumber: true } : {}),
  ...(component.type === 'iban' ? { iban: true } : {}),
  ...(component.type === 'activities' && submissionMethod === 'digital' ? { required: true } : {}),
  customValidation:
    component.validate?.custom && !isRedundantLegacyCustomValidation(component) ? { component } : undefined,
  ...(component.validate?.customMessage ? { customMessage: component.validate.customMessage } : {}),
});

const hasRules = (rules: ValidationRules) => Object.values(rules).some((rule) => rule !== undefined && rule !== false);

const createDescriptor = (
  component: Component,
  submissionPath: string,
  field: string,
  rules: ValidationRules,
): ValidationDescriptor => ({
  submissionPath,
  field,
  rules,
  ...(component.type === 'attachment' ? { component } : {}),
});

const getConditionRow = (component: Component, submission?: Submission) =>
  component.baseSubmissionPath
    ? submissionUtils.getSubmissionValue(component.baseSubmissionPath, submission)
    : undefined;

/**
 * The identity component stores a nested object and shows a "do you have an identity number" radio,
 * then either a national-identity-number field or a birthdate field. It emits its own descriptors so
 * each nested value validates (and focuses from the error summary) like a standalone field.
 */
const collectIdentityDescriptors = (component: Component, submission?: Submission): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const required = component.validate?.required ?? true;
  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as SubmissionIdentity | undefined;
  const showsPrefilledIdentityNumber = !!value?.identitetsnummer && !value?.harDuFodselsnummer;

  const descriptors: ValidationDescriptor[] = showsPrefilledIdentityNumber
    ? []
    : [
        {
          submissionPath: `${submissionPath}.harDuFodselsnummer`,
          field: component.customLabels?.doYouHaveIdentityNumber ?? TEXTS.statiske.identity.doYouHaveIdentityNumber,
          rules: { required },
        },
      ];

  if (value?.harDuFodselsnummer === 'ja' || showsPrefilledIdentityNumber) {
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

const collectAddressDescriptors = (
  component: Component,
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const required = component.validate?.required ?? false;
  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as SubmissionAddress | undefined;
  const addressType = resolveAddressType(component, value, submissionMethod);
  const showAddressTypeChoice = shouldShowAddressTypeChoice(component, submissionMethod);
  const descriptors: ValidationDescriptor[] = [];

  if (showAddressTypeChoice) {
    descriptors.push({
      submissionPath: `${submissionPath}.borDuINorge`,
      field: component.customLabels?.livesInNorway ?? TEXTS.statiske.address.livesInNorway,
      rules: { required },
    });

    if (value?.borDuINorge === 'ja') {
      descriptors.push({
        submissionPath: `${submissionPath}.vegadresseEllerPostboksadresse`,
        field: TEXTS.statiske.address.yourContactAddress,
        rules: { required },
      });
    }
  }

  if (addressType === 'NORWEGIAN_ADDRESS') {
    descriptors.push(
      {
        submissionPath: `${submissionPath}.co`,
        field: TEXTS.statiske.address.co.label,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.adresse`,
        field: TEXTS.statiske.address.streetAddress,
        rules: { required, coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.postnummer`,
        field: TEXTS.statiske.address.postalCode,
        rules: { required, postalCode: true },
      },
      {
        submissionPath: `${submissionPath}.bySted`,
        field: TEXTS.statiske.address.postalName,
        rules: { required, coverPageValue: true },
      },
    );
  }

  if (addressType === 'POST_OFFICE_BOX') {
    descriptors.push(
      {
        submissionPath: `${submissionPath}.co`,
        field: TEXTS.statiske.address.co.label,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.postboks`,
        field: TEXTS.statiske.address.poBox,
        rules: { required, coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.postnummer`,
        field: TEXTS.statiske.address.postalCode,
        rules: { required, postalCode: true },
      },
      {
        submissionPath: `${submissionPath}.bySted`,
        field: TEXTS.statiske.address.postalName,
        rules: { required, coverPageValue: true },
      },
    );
  }

  if (addressType === 'FOREIGN_ADDRESS') {
    descriptors.push(
      {
        submissionPath: `${submissionPath}.co`,
        field: TEXTS.statiske.address.co.label,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.adresse`,
        field: TEXTS.statiske.address.streetAddressLong,
        rules: { required, coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.bygning`,
        field: TEXTS.statiske.address.building,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.postnummer`,
        field: TEXTS.statiske.address.postalCode,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.bySted`,
        field: TEXTS.statiske.address.location,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.region`,
        field: TEXTS.statiske.address.region,
        rules: { coverPageValue: true },
      },
      {
        submissionPath: `${submissionPath}.land`,
        field: TEXTS.statiske.address.country,
        rules: { required },
      },
    );
  }

  return descriptors;
};

const collectAddressValidityDescriptors = (component: Component, submission?: Submission): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const required = component.validate?.required ?? false;
  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as
    { gyldigFraOgMed?: string; gyldigTilOgMed?: string } | undefined;
  const minDate = dateUtils.addDays(-365);
  const maxDate = dateUtils.addDays(365);

  return [
    {
      submissionPath: `${submissionPath}.gyldigFraOgMed`,
      field: TEXTS.statiske.address.validFrom,
      rules: { required, date: true, fromDate: minDate, toDate: maxDate },
    },
    {
      submissionPath: `${submissionPath}.gyldigTilOgMed`,
      field: TEXTS.statiske.address.validTo,
      rules: { date: true, fromDate: value?.gyldigFraOgMed || minDate, toDate: maxDate },
    },
  ];
};

const collectPhoneNumberDescriptors = (component: Component, submission?: Submission): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const field = component.label ?? component.key;

  if (!component.showAreaCode) {
    return [
      {
        submissionPath,
        field,
        rules: {
          required: component.validate?.required,
          minLength: typeof component.validate?.minLength === 'number' ? component.validate.minLength : undefined,
          maxLength: typeof component.validate?.maxLength === 'number' ? component.validate.maxLength : undefined,
          phoneNumber: { showAreaCode: false },
        },
      },
    ];
  }

  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as { areaCode?: string } | undefined;

  return [
    {
      submissionPath: `${submissionPath}.number`,
      field,
      rules: {
        required: component.validate?.required,
        minLength: typeof component.validate?.minLength === 'number' ? component.validate.minLength : undefined,
        maxLength: typeof component.validate?.maxLength === 'number' ? component.validate.maxLength : undefined,
        phoneNumber: { showAreaCode: true, areaCode: value?.areaCode },
      },
    },
  ];
};

const collectSenderDescriptors = (component: Component): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const required = component.validate?.required ?? false;

  if (component.senderRole === 'organization') {
    return [
      {
        submissionPath: `${submissionPath}.organization.number`,
        field: component.customLabels?.organizationNumber ?? 'Organisasjonsnummer',
        rules: { required, organizationNumber: true },
      },
      {
        submissionPath: `${submissionPath}.organization.name`,
        field: component.customLabels?.organizationName ?? 'Virksomhetsnavn',
        rules: { required, coverPageValue: true },
      },
    ];
  }

  return [
    {
      submissionPath: `${submissionPath}.person.nationalIdentityNumber`,
      field: component.customLabels?.nationalIdentityNumber ?? TEXTS.statiske.identity.identityNumber,
      rules: { required, nationalIdentityNumber: true },
    },
    {
      submissionPath: `${submissionPath}.person.firstName`,
      field: component.customLabels?.firstName ?? TEXTS.statiske.identity.firstName,
      rules: { required, coverPageValue: true },
    },
    {
      submissionPath: `${submissionPath}.person.surname`,
      field: component.customLabels?.surname ?? TEXTS.statiske.identity.surname,
      rules: { required, coverPageValue: true },
    },
  ];
};

const collectDrivingListDescriptors = (
  component: Component,
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as DrivingListSubmission | undefined;
  const descriptors: ValidationDescriptor[] = [];

  if (submissionMethod === 'paper') {
    descriptors.push({
      submissionPath: `${submissionPath}.selectedDate`,
      field: TEXTS.statiske.drivingList.datePicker,
      rules: { required: true, date: true, toDate: dateUtils.toSubmissionDate() },
    });

    descriptors.push({
      submissionPath: `${submissionPath}.parking`,
      field: TEXTS.statiske.drivingList.parking,
      rules: { required: true },
    });

    if (value?.selectedDate && value?.parking !== undefined && value?.parking !== null) {
      descriptors.push({
        submissionPath: `${submissionPath}.dates`,
        field: TEXTS.statiske.drivingList.dateSelect,
        rules: { required: true },
      });
    }
  } else if (submissionMethod === 'digital') {
    descriptors.push({
      submissionPath: `${submissionPath}.selectedVedtaksId`,
      field: TEXTS.statiske.activities.label,
      rules: { required: true },
    });

    if (value?.selectedVedtaksId) {
      descriptors.push({
        submissionPath: `${submissionPath}.dates`,
        field: TEXTS.statiske.drivingList.dateSelect,
        rules: { required: true },
      });
    }
  }

  value?.dates?.forEach((dateEntry, index) => {
    descriptors.push({
      submissionPath: `${submissionPath}.dates[${index}].parking`,
      field: TEXTS.statiske.drivingList.parkingExpenses,
      rules: {
        drivingListParkingExpense: {
          date: dateEntry.date,
          enforceMaxHundred: submissionMethod === 'digital',
        },
      },
    });
  });

  return descriptors;
};

const collectValidationDescriptors = (
  components: Component[],
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
  pageComponents: Component[] = components,
): ValidationDescriptor[] =>
  components.flatMap((component) => {
    if (component.calculateValue) {
      return collectValidationDescriptors(component.components ?? [], submission, submissionMethod, pageComponents);
    }

    const rules = toRules(component, pageComponents, submission, submissionMethod);
    const submissionPath = getResolvedSubmissionPath(component);
    const isVisible =
      !component.hidden &&
      checkCondition(
        component,
        getConditionRow(component, submission),
        submission?.data,
        undefined,
        undefined,
        submission,
        { submissionMethod },
      );

    if (!isVisible) {
      return [];
    }

    if (component.type === 'identity') {
      return collectIdentityDescriptors(component, submission);
    }

    if (component.type === 'navAddress') {
      return collectAddressDescriptors(component, submission, submissionMethod);
    }

    if (component.type === 'addressValidity') {
      return collectAddressValidityDescriptors(component, submission);
    }

    if (component.type === 'phoneNumber') {
      return collectPhoneNumberDescriptors(component, submission);
    }

    if (component.type === 'sender') {
      return collectSenderDescriptors(component);
    }

    if (component.type === 'drivinglist') {
      return collectDrivingListDescriptors(component, submission, submissionMethod);
    }

    if (component.type === 'attachment') {
      return [createDescriptor(component, submissionPath, component.label ?? component.key, rules)];
    }

    if (component.type === 'dataFetcher') {
      const submissionPath = getResolvedSubmissionPath(component);
      const fetcher = submission ? dataFetcherUtils.dataFetcher(submissionPath, submission) : undefined;
      const shouldValidate =
        submissionMethod === 'digital' && component.validate?.required && fetcher?.success && !fetcher.empty;

      return shouldValidate
        ? [
            createDescriptor(component, submissionPath, component.label ?? component.key, {
              required: true,
              dataFetcherSelection: true,
            }),
          ]
        : [];
    }

    if (component.type === 'datagrid') {
      const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
      if (!component.components?.length) {
        return [];
      }
      const renderedRows = getRenderedDataGridRows(Array.isArray(rows) ? rows : [], component.initEmpty);

      return renderedRows.flatMap((_, index) =>
        collectValidationDescriptors(
          enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
          submission,
          submissionMethod,
          pageComponents,
        ),
      );
    }

    return [
      ...(component.input !== false && hasRules(rules)
        ? [createDescriptor(component, submissionPath, component.label ?? component.key, rules)]
        : []),
      ...collectValidationDescriptors(component.components ?? [], submission, submissionMethod, pageComponents),
    ];
  });

/** Builds validation descriptors for the currently visible input components. */
const deriveValidations = (
  activeComponents: Component[],
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
): ValidationDescriptor[] => {
  const pathAwareComponents = activeComponents.some((component) => 'baseSubmissionPath' in component)
    ? activeComponents
    : enrichComponentsWithBaseSubmissionPath(activeComponents);

  return collectValidationDescriptors(pathAwareComponents, submission, submissionMethod);
};

export { deriveValidations };
export type { ValidationDescriptor };
