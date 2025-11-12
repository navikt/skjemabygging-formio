import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfPhoneNumber = ({ component, submissionPath, formContextValue, languagesContextValue }: PdfComponentProps) => {
  const { label, showAreaCode } = component;
  const { translate } = languagesContextValue;
  const { submission } = formContextValue;

  const value = formComponentUtils.getPdfSubmissionValue(submissionPath, submission);

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
