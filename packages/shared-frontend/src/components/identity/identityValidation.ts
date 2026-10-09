import { CustomLabels, dateUtils, SubmissionIdentity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { toDatePickerValidation } from '../date/dateValidation';
import { toFieldValidation, toValidationFields } from '../shared/fieldValidation';

interface IdentityValidationInput {
  statePath: string;
  required?: boolean;
  readOnly?: boolean;
  customLabels?: CustomLabels;
  value?: SubmissionIdentity;
}

/** An identity number that was prefilled is shown instead of the answer the user would give. */
const showsPrefilledIdentityNumber = (value?: SubmissionIdentity) =>
  !!value?.identitetsnummer && !value?.harDuFodselsnummer;

/**
 * The fields the inputs of an identity register for the answer it currently holds. Pure, so the
 * headless page rebuild produces exactly what the rendered inputs do.
 */
const toIdentityValidationFields = ({
  statePath,
  required = true,
  readOnly,
  customLabels,
  value,
}: IdentityValidationInput): ValidationField[] => {
  const identityNumberPath = `${statePath}.identitetsnummer`;
  const identityNumberValidation = toFieldValidation({
    statePath: identityNumberPath,
    label: TEXTS.statiske.identity.identityNumber,
    required,
    validation: { nationalIdentityNumber: true },
  });

  if (readOnly) {
    return toValidationFields(identityNumberPath, value?.identitetsnummer, identityNumberValidation);
  }

  const isPrefilled = showsPrefilledIdentityNumber(value);
  const choicePath = `${statePath}.harDuFodselsnummer`;
  const fields = toValidationFields(
    choicePath,
    value?.harDuFodselsnummer,
    toFieldValidation({
      statePath: choicePath,
      label: customLabels?.doYouHaveIdentityNumber ?? TEXTS.statiske.identity.doYouHaveIdentityNumber,
      required: required && !isPrefilled,
    }),
  );

  if (value?.harDuFodselsnummer === 'ja' || isPrefilled) {
    return [...fields, ...toValidationFields(identityNumberPath, value?.identitetsnummer, identityNumberValidation)];
  }

  if (value?.harDuFodselsnummer === 'nei') {
    const birthDatePath = `${statePath}.fodselsdato`;
    return [
      ...fields,
      ...toValidationFields(
        birthDatePath,
        value?.fodselsdato,
        toDatePickerValidation({
          statePath: birthDatePath,
          label: TEXTS.statiske.identity.yourBirthdate,
          required,
          fromDate: '1900-01-01',
          toDate: dateUtils.toSubmissionDate(),
        }),
      ),
    ];
  }

  return fields;
};

export { showsPrefilledIdentityNumber, toIdentityValidationFields };
export type { IdentityValidationInput };
