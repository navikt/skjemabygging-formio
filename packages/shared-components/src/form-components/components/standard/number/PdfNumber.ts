import { numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfNumber = ({ component, submissionPath, formContext, languagesContext }: PdfComponentProps) => {
  const { label } = component;
  const { translate } = languagesContext;
  const { submission } = formContext;
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
