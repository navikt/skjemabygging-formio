import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultListAnswer = ({
  component,
  submissionPath,
  formContextValue,
  languagesContextValue,
}: PdfComponentProps) => {
  const { values, label } = component;
  const { submission } = formContextValue;
  const { translate } = languagesContextValue;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (!values || value === undefined) {
    return null;
  }

  const valueObject = values.find((valueObject) => String(valueObject.value) === String(value?.value ?? value));

  if (!valueObject) {
    return null;
  }

  return {
    label: translate(label),
    verdi: translate(valueObject.label),
  };
};

export default DefaultListAnswer;
