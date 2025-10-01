import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultAnswer = ({ component, submissionPath, formContext, languagesContext }: PdfComponentProps) => {
  const { values, label } = component;
  const { submission } = formContext;
  const { translate } = languagesContext;
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
    visningsVariant: 'PUNKTLISTE',
  };
};

export default DefaultAnswer;
