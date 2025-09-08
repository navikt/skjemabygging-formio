import { useForm } from '../../../../context/form/FormContext';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const TextFieldSummary = ({ component, submissionPath }: PdfComponentProps) => {
  const { label } = component;
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  return {
    label: label,
    verdi: value,
  };
};

export default TextFieldSummary;
