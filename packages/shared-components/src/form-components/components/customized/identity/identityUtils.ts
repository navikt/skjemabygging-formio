import {
  dateUtils,
  formatNationalIdentityNumber,
  SubmissionIdentity,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';

const getIdentityLabel = (value: SubmissionIdentity) => {
  return value?.identitetsnummer ? TEXTS.statiske.identity.identityNumber : TEXTS.statiske.identity.yourBirthdate;
};

const getIdentityValue = (value: SubmissionIdentity, format: boolean = true) => {
  return value?.identitetsnummer
    ? format
      ? formatNationalIdentityNumber(value?.identitetsnummer)
      : value?.identitetsnummer
    : value?.fodselsdato
      ? dateUtils.toLocaleDate(value?.fodselsdato)
      : undefined;
};

export { getIdentityLabel, getIdentityValue };
