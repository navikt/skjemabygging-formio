import { FormSummary } from '@navikt/ds-react';
import { buildDefaultListSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';

const DefaultListAnswer = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const summaryNode = buildDefaultListSummaryNode({
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

export default DefaultListAnswer;
