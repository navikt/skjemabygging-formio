import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultAnswer = (
  { component, submissionPath, formContext, languagesContext }: PdfComponentProps,
  valueFormat?: (value: any) => string | number,
) => {
  const { label } = component;
  const { translate } = languagesContext;
  const { submission } = formContext;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return {
    label: translate(label),
    verdi: valueFormat === undefined ? value : valueFormat(value),
  };
};

export default DefaultAnswer;
