import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils, numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultLabel from '../../shared/SummaryDefaultLabel';
import { FormComponentProps } from '../../types';

const SummaryNumber = (props: FormComponentProps) => {
  const { submissionPath, submission } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{numberUtils.toLocaleString(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryNumber;
