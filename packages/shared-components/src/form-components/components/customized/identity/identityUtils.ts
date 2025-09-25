import {
  dateUtils,
  formatNationalIdentityNumber,
  SubmissionIdentity,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';

const getIdentityLabel = (value: SubmissionIdentity) => {
  return value?.identitetsnummer ? TEXTS.statiske.identity.identityNumber : TEXTS.statiske.identity.yourBirthdate;
};

const getIdentityValue = (value: SubmissionIdentity) => {
  return value?.identitetsnummer
    ? formatNationalIdentityNumber(value?.identitetsnummer)
    : dateUtils.toLocaleDate(value?.fodselsdato);
};

export { getIdentityLabel, getIdentityValue };
