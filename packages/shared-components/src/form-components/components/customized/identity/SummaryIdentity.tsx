import { FormSummary } from '@navikt/ds-react';
import { dateUtils, formatNationalIdentityNumber, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryIdentity = ({ submissionPath }: FormComponentProps) => {
  const { translate } = useLanguages();
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (!value?.identitetsnummer && !value?.fodselsdato)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>
        {value?.identitetsnummer
          ? translate(TEXTS.statiske.identity.identityNumber)
          : translate(TEXTS.statiske.identity.yourBirthdate)}
      </FormSummary.Label>
      <FormSummary.Value>
        {value?.identitetsnummer
          ? formatNationalIdentityNumber(value?.identitetsnummer)
          : dateUtils.toLocaleDate(value?.fodselsdato)}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryIdentity;
