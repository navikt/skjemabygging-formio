import { SubmissionIdentity } from '../../../models/submission/identity';
import { TEXTS } from '../../../texts';
import { dateUtils } from '../../../utils/date/dateUtils';
import { formatUtils } from '../../../utils/format/formatUtils';

const getIdentityLabel = (value: SubmissionIdentity) => {
  return value?.identitetsnummer ? TEXTS.statiske.identity.identityNumber : TEXTS.statiske.identity.yourBirthdate;
};

const getIdentityValue = (value: SubmissionIdentity, format: boolean = true) => {
  return value?.identitetsnummer
    ? format
      ? formatUtils.formatNationalIdentityNumber(value?.identitetsnummer)
      : value?.identitetsnummer
    : value?.fodselsdato
      ? dateUtils.toLocaleDate(value?.fodselsdato)
      : undefined;
};

export { getIdentityLabel, getIdentityValue };
