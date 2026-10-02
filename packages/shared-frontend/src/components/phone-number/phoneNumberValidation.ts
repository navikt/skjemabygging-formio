import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { FieldValidationInput, toFieldValidation, toValidationFields } from '../shared/fieldValidation';
import { FieldValidationProp, PhoneNumberValidation } from '../types';

/** The calling code the area code selector starts on. It is a UI default, never a validation rule. */
const DEFAULT_AREA_CODE = '+47';

interface PhoneNumberValue {
  areaCode?: string;
  number?: string;
}

interface PhoneNumberValidationInput extends FieldValidationInput {
  showAreaCode?: boolean;
  value?: PhoneNumberValue | string;
}

const toPhoneNumberValue = (value: PhoneNumberValue | string | undefined): PhoneNumberValue | undefined =>
  typeof value === 'object' && value !== null ? value : undefined;

/**
 * The rules the phone number adds to the ones its caller declared. Only the calling code the user
 * actually selected is passed on, so nothing but a Norwegian number is held to eight digits.
 */
const toPhoneNumberRules = (
  showAreaCode: boolean,
  countryCallingCode: string | undefined,
  validation: PhoneNumberValidation | undefined,
): FieldValidationProp => ({
  ...validation,
  phoneNumber: showAreaCode ? { showAreaCode: true, countryCallingCode } : { showAreaCode: false },
});

/**
 * The fields a phone number renders: the number itself, and - when the area code is shown - the
 * calling code selector in front of it. Pure, so the headless page rebuild registers exactly what
 * the rendered inputs do.
 */
const toPhoneNumberValidationFields = ({
  showAreaCode = false,
  value,
  ...input
}: PhoneNumberValidationInput): ValidationField[] => {
  if (!showAreaCode) {
    return toValidationFields(
      input.statePath,
      value,
      toFieldValidation({ ...input, validation: toPhoneNumberRules(false, undefined, input.validation) }),
    );
  }

  const phoneNumberValue = toPhoneNumberValue(value);
  const areaCodePath = `${input.statePath}.areaCode`;
  const numberPath = `${input.statePath}.number`;

  return [
    ...toValidationFields(
      areaCodePath,
      phoneNumberValue?.areaCode,
      toFieldValidation({
        statePath: areaCodePath,
        label: TEXTS.statiske.phoneNumber.areaCodeLabel,
        required: false,
      }),
    ),
    ...toValidationFields(
      numberPath,
      phoneNumberValue?.number,
      toFieldValidation({
        ...input,
        statePath: numberPath,
        validation: toPhoneNumberRules(true, phoneNumberValue?.areaCode, input.validation),
      }),
    ),
  ];
};

export { DEFAULT_AREA_CODE, toPhoneNumberRules, toPhoneNumberValidationFields };
export type { PhoneNumberValidationInput, PhoneNumberValue };
