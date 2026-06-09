import { PdfData, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../types';

const DefaultListAnswer = (props: PdfComponentProps): PdfData | null => {
  const { component, submissionPath, submission, translate } = props;
  const { values, label } = component;
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
