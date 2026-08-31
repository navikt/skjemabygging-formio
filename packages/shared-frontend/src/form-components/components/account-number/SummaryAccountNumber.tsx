import { FormSummary } from '@navikt/ds-react';
import { formatUtils, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { AccountNumberDefinition } from '../../component-types';
import DefaultLabel from '../../shared/SummaryDefaultLabel';
import { FormComponentProps } from '../../types';

const SummaryAccountNumber = (props: FormComponentProps<AccountNumberDefinition>) => {
  const { submission, submissionPath } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{formatUtils.formatAccountNumber(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryAccountNumber;
