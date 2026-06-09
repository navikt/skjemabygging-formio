import {
  submissionUtils as formComponentUtils,
  numberUtils,
  PdfData,
} from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const PdfNumber = (props: PdfComponentProps): PdfData | null => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return {
    label: translate(label),
    verdi: numberUtils.toLocaleString(value),
  };
};

export default PdfNumber;
