import { buildMonthSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import { SummaryFieldNodeAnswers } from '../../shared/form-summary';

const SummaryMonthPicker = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate, currentLanguage } = props;
  const summaryNode = buildMonthSummaryNode({
    component,
    submissionPath,
    submission,
    translate,
    currentLanguage,
  });

  if (!summaryNode) {
    return null;
  }

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default SummaryMonthPicker;
