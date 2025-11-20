import { numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfNumber = (props: PdfComponentProps) => {
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
