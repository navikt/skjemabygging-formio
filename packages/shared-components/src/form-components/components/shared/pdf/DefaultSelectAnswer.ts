import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultSelectAnswer = ({ component, submissionPath }: PdfComponentProps) => {
  const { label } = component;
  const { submission } = useForm();
  const { translate } = useLanguages();
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
