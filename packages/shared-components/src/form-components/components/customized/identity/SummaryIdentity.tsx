import { FormSummary } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import { getIdentityLabel, getIdentityValue } from './identityUtils';

const SummaryIdentity = ({ submissionPath }: FormComponentProps) => {
  const { translate } = useLanguages();
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (!value?.identitetsnummer && !value?.fodselsdato)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(getIdentityLabel(value))}</FormSummary.Label>
      <FormSummary.Value>{getIdentityValue(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryIdentity;
