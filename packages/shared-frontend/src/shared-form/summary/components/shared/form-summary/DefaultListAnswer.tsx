import { buildDefaultListSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import SummaryFieldNodeAnswers from './SummaryFieldNodeAnswers';

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

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default DefaultListAnswer;
