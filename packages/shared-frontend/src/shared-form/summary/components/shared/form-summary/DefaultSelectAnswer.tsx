import { FormSummary } from '@navikt/ds-react';
import { buildDefaultSelectSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';

const DefaultSelectAnswer = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const summaryNode = buildDefaultSelectSummaryNode({
    component,
    submissionPath,
    submission,
    translate,
  });

  if (!summaryNode) {
    return null;
  }

  return (
    <FormSummary.Answer>
      {summaryNode.label && <FormSummary.Label>{summaryNode.label}</FormSummary.Label>}
      <FormSummary.Value>{summaryNode.values[0]?.value}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultSelectAnswer;
