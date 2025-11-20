import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfCheckbox = (props: PdfComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  // Do not show anything if the checkbox is not checked
  if (!value) {
    return null;
  }

  return {
    label: translate(label),
    verdi: value ? translate(TEXTS.common.yes) : translate(TEXTS.common.no),
  };
};

export default PdfCheckbox;
