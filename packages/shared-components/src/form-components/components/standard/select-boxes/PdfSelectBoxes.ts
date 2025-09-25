import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfSelectBoxes = ({ component, submissionPath }: PdfComponentProps) => {
  const { values, label } = component;
  const { translate } = useLanguages();
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !values || values.length === 0) {
    return null;
  }

  const valueObjects = values
    .filter((checkbox) => value[checkbox.value] === true)
    .map((checkbox) => translate(checkbox.label));

  if (!valueObjects || valueObjects.length === 0) {
    return valueObjects;
  }

  return {
    label: translate(label),
    verdiliste: valueObjects.map((boxValue) => {
      return { verdi: boxValue };
    }),
  };
};

export default PdfSelectBoxes;
