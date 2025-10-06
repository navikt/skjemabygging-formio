import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfSelectBoxes = ({ component, submissionPath, formContextValue, languagesContextValue }: PdfComponentProps) => {
  const { values, label } = component;
  const { translate } = languagesContextValue;
  const { submission } = formContextValue;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !values || values.length === 0) {
    return null;
  }

  const valueObjects = values
    .filter((checkbox) => value[checkbox.value] === true)
    .map((checkbox) => translate(checkbox.label));

  if (!valueObjects || valueObjects.length === 0) {
    return null;
  }

  return {
    label: translate(label),
    verdiliste: valueObjects.map((boxValue) => {
      return { verdi: boxValue };
    }),
    visningsVariant: 'PUNKTLISTE',
  };
};

export default PdfSelectBoxes;
