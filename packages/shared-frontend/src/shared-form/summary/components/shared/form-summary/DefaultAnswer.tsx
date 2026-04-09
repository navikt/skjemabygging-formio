import { FormSummary } from '@navikt/ds-react';
import { buildDefaultSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';

interface Props extends FormComponentProps {
  valueFormat?: (value: any) => string | number;
}

const DefaultAnswer = (props: Props) => {
  const { component, submissionPath, submission, translate, valueFormat } = props;
  const summaryNode = buildDefaultSummaryNode({
    component,
    submissionPath,
    submission,
    translate,
    valueFormat,
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

export default DefaultAnswer;
