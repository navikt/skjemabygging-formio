import {
  Component,
  dataFetcherUtils,
  dateUtils,
  DrivingListSubmission,
  Submission,
  SubmissionIdentity,
  SubmissionMethod,
  submissionUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getResolvedSubmissionPath } from '../context/form-definition/formDefinitionUtils';
import { ValidationDescriptor } from './validationDescriptorTypes';

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

const collectPhoneNumberDescriptors = (component: Component, submission?: Submission): ValidationDescriptor[] => {
  const submissionPath = getResolvedSubmissionPath(component);
  const field = component.label ?? component.key;
  const phoneNumberRules = {
    required: component.validate?.required,
    minLength: typeof component.validate?.minLength === 'number' ? component.validate.minLength : undefined,
    maxLength: typeof component.validate?.maxLength === 'number' ? component.validate.maxLength : undefined,
  };

  if (!component.showAreaCode) {
    return [{ submissionPath, field, rules: { ...phoneNumberRules, phoneNumber: { showAreaCode: false } } }];
  }

  const value = submissionUtils.getSubmissionValue(submissionPath, submission) as { areaCode?: string } | undefined;
  return [
    {
      submissionPath: `${submissionPath}.number`,
      field,
      rules: { ...phoneNumberRules, phoneNumber: { showAreaCode: true, areaCode: value?.areaCode } },
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
    descriptors.push(
      {
        submissionPath: `${submissionPath}.selectedDate`,
        field: TEXTS.statiske.drivingList.datePicker,
        rules: { required: true, date: true, toDate: dateUtils.toSubmissionDate() },
      },
      {
        submissionPath: `${submissionPath}.parking`,
        field: TEXTS.statiske.drivingList.parking,
        rules: { required: true },
      },
    );

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

const shouldValidateDataFetcher = (
  component: Component,
  submissionPath: string,
  submission: Submission | undefined,
  submissionMethod: SubmissionMethod | undefined,
) => {
  const fetcher = submission ? dataFetcherUtils.dataFetcher(submissionPath, submission) : undefined;
  return submissionMethod === 'digital' && component.validate?.required && fetcher?.success && !fetcher.empty;
};

export {
  collectDrivingListDescriptors,
  collectIdentityDescriptors,
  collectPhoneNumberDescriptors,
  collectSenderDescriptors,
  shouldValidateDataFetcher,
};
