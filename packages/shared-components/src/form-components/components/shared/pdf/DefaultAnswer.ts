import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultAnswer = (
  { component, submissionPath }: PdfComponentProps,
  valueFormat?: (value: any) => string | number,
) => {
  const { label } = component;
  const { translate } = useLanguages();
  const { submission } = useForm();

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
