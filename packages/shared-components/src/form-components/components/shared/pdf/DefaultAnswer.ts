import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultAnswer = (props: PdfComponentProps, valueFormat?: (value: any) => string | number): PdfData | null => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;

  const value = formComponentUtils.getPdfSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return {
    label: translate(label),
    verdi: valueFormat === undefined ? String(value) : String(valueFormat(value)),
  };
};

export default DefaultAnswer;
