import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import * as ibantools from 'ibantools';

const getErrorMessage = (key: string, translate) => {
  return translate(key) === key ? TEXTS.validering[key] : translate(key);
};

const validateIBAN = (value: string, translate) => {
  if (value === '' || value === undefined) {
    return undefined;
  }

  const { validateIBAN: validate, ValidationErrorsIBAN } = ibantools;
  const { valid, errorCodes } = validate(value);

  if (valid) {
    return undefined;
  }

  if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANLength)) {
    return getErrorMessage('wrongBBANLength', translate);
  }

  if (errorCodes.includes(ValidationErrorsIBAN.NoIBANCountry)) {
    return getErrorMessage('noIBANCountry', translate);
  }

  return getErrorMessage('invalidIBAN', translate);
};

export { validateIBAN };
