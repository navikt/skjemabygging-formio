import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultAnswer = (
  { component, submissionPath, formContextValue, languagesContextValue }: PdfComponentProps,
  valueFormat?: (value: any) => string | number,
) => {
  const { label } = component;
  const { translate } = languagesContextValue;
  const { submission } = formContextValue;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return {
    label: translate(label),
    verdi: valueFormat === undefined ? String(value) : String(valueFormat(value)),
  };
};

export default DefaultAnswer;
