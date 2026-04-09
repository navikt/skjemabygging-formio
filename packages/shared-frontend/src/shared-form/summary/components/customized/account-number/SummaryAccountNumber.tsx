import { buildAccountNumberSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import { SummaryFieldNodeAnswers } from '../../shared/form-summary';

const SummaryAccountNumber = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const summaryNode = buildAccountNumberSummaryNode({ component, submissionPath, submission, translate });

  if (!summaryNode) {
    return null;
  }

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default SummaryAccountNumber;
