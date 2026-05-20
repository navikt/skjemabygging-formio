import { PdfData, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../types';

const DefaultSelectAnswer = (props: PdfComponentProps): PdfData | null => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value?.label === undefined) {
    return null;
  }

  return {
    label: translate(label),
    verdi: translate(value.label),
  };
};

export default DefaultSelectAnswer;
