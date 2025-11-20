import { FormSummary } from '@navikt/ds-react';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import { getIdentityLabel, getIdentityValue } from './identityUtils';

const SummaryIdentity = (props: FormComponentProps) => {
  const { submission, submissionPath, translate } = props;
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
