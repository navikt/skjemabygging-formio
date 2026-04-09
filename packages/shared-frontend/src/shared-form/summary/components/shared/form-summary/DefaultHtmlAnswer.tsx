import { FormSummary } from '@navikt/ds-react';
import { buildDefaultHtmlSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';

const DefaultHtmlAnswer = (props: FormComponentProps) => {
  const { component, submissionPath, translate } = props;
  const summaryNode = buildDefaultHtmlSummaryNode({
    component,
    submissionPath,
    translate,
  });

  if (!summaryNode) {
    return null;
  }

  return (
    <FormSummary.Answer>
      {summaryNode.label && <FormSummary.Label>{summaryNode.label}</FormSummary.Label>}
      <div dangerouslySetInnerHTML={{ __html: summaryNode.values[0]?.html ?? '' }} />
    </FormSummary.Answer>
  );
};

export default DefaultHtmlAnswer;
