import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../types';

const SummaryActivities = (props: FormComponentProps) => {
  const { submission, submissionPath, component, translate } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <FormSummary.Value>{value.text}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryActivities;
