import { buildDefaultHtmlSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import SummaryFieldNodeAnswers from './SummaryFieldNodeAnswers';

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

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default DefaultHtmlAnswer;
