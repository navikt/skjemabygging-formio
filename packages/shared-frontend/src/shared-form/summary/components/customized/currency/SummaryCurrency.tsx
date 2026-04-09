import { buildCurrencySummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import { SummaryFieldNodeAnswers } from '../../shared/form-summary';

const SummaryCurrency = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const summaryNode = buildCurrencySummaryNode({ component, submissionPath, submission, translate });

  if (!summaryNode) {
    return null;
  }

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default SummaryCurrency;
