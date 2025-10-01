import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultSelectAnswer = ({ component, submissionPath, formContext, languagesContext }: PdfComponentProps) => {
  const { label } = component;
  const { submission } = formContext;
  const { translate } = languagesContext;
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
