import { buildSelectBoxesSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import { SummaryFieldNodeAnswers } from '../../shared/form-summary';

const SummarySelectBoxes = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const summaryNode = buildSelectBoxesSummaryNode({ component, submissionPath, submission, translate });

  if (!summaryNode) {
    return null;
  }

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default SummarySelectBoxes;
