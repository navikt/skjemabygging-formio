import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import * as ibantools from 'ibantools';

const getErrorMessage = (key, translate) => {
  return translate(key) === key ? TEXTS.validering[key] : translate(key);
};

const validateIBAN = ({ value, label, required = false }, translate) => {
  const { validateIBAN: validate, ValidationErrorsIBAN } = ibantools;
  const { valid, errorCodes } = validate(value);

  if (errorCodes.includes(ValidationErrorsIBAN.NoIBANProvided)) {
    return required ? translate('required', { field: label }) : undefined;
  }

  if (valid) {
    return undefined;
  }

  if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANLength)) return getErrorMessage('wrongBBANLength', translate);
  if (errorCodes.includes(ValidationErrorsIBAN.NoIBANCountry)) return getErrorMessage('noIBANCountry', translate);

  return getErrorMessage('invalidIBAN', translate);
};

export { validateIBAN };
