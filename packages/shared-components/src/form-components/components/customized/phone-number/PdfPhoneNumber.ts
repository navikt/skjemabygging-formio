import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfPhoneNumber = ({ component, submissionPath }: PdfComponentProps) => {
  const { label, showAreaCode } = component;
  const { translate } = useLanguages();
  const { submission } = useForm();

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (showAreaCode && (value.areaCode === undefined || value.number === undefined))) {
    return null;
  }

  const phoneNumber = showAreaCode ? `${value.areaCode} ${value.number}` : value;

  return {
    label: translate(label),
    verdi: phoneNumber,
  };
};

export default PdfPhoneNumber;
