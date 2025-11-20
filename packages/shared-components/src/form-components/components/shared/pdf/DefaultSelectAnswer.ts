import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultSelectAnswer = (props: PdfComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value?.label === undefined) {
    return null;
  }

  return {
    label: translate(label),
    verdi: translate(value.label),
  };
};

export default DefaultSelectAnswer;
