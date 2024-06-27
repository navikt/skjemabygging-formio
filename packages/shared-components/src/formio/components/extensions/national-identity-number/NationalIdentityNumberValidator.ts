import { idnr } from '@navikt/fnrvalidator';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const ALLOWED_TYPES = ['fnr', 'dnr'];
const ALLOWED_TEST_TYPES = ['fnr', 'dnr', 'hnr', 'tnr', 'dnr-and-hnr'];
type DateValidationOptions = {
  value: string;
  label: string;
  required?: boolean;
  allowTestTypes: boolean;
};

const validateNationalIdentityNumber = (
  { value, label, required = false, allowTestTypes }: DateValidationOptions,
  translate,
) => {
  if (value === '') {
    return required ? translate('required', { field: label }) : undefined;
  }

  const result = idnr(value.replace(' ', '') ?? '');
  const errorMessage: string =
    translate('fodselsnummerDNummer') === 'fodselsnummerDNummer'
      ? TEXTS.validering.fodselsnummerDNummer
      : translate('fodselsnummerDNummer');

  if (result.status === 'invalid') {
    return errorMessage;
  }

  // Allow only fnr and dnr in production
  if (ALLOWED_TYPES.includes(result.type)) {
    return undefined;
  }

  // Allow all types in test environments
  if (allowTestTypes && ALLOWED_TEST_TYPES.includes(result.type)) {
    return undefined;
  }

  return errorMessage;
};

export { validateNationalIdentityNumber };
