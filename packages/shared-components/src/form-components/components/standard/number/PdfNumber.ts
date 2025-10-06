import { numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfNumber = ({ component, submissionPath, formContextValue, languagesContextValue }: PdfComponentProps) => {
  const { label } = component;
  const { translate } = languagesContextValue;
  const { submission } = formContextValue;
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
