import { buildDefaultSummaryNode } from '@navikt/skjemadigitalisering-shared-form';
import { FormComponentProps } from '../../../types';
import SummaryFieldNodeAnswers from './SummaryFieldNodeAnswers';

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

  return <SummaryFieldNodeAnswers node={summaryNode} />;
};

export default DefaultAnswer;
