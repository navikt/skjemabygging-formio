import { buildDefaultSelectSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import SummaryFieldNodeAnswers from './SummaryFieldNodeAnswers';

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

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default DefaultSelectAnswer;
