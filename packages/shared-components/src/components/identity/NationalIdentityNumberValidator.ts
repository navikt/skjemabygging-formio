import { TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';

type DateValidationOptions = {
  value: string;
  allowTestTypes: boolean;
};

const validateNationalIdentityNumber = ({ value, allowTestTypes }: DateValidationOptions, translate) => {
  if (value === '' || value === undefined) {
    return undefined;
  }

  if (validatorUtils.isNationalIdentityNumber(value, { allowTestTypes })) {
    return undefined;
  }

  return translate('fodselsnummerDNummer') === 'fodselsnummerDNummer'
    ? TEXTS.validering.fodselsnummerDNummer
    : translate('fodselsnummerDNummer');
};

export { validateNationalIdentityNumber };
