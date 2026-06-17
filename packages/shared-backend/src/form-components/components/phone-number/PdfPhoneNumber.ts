import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const PdfPhoneNumber = (props: PdfComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { label, showAreaCode } = component;

  const value = formComponentUtils.getPdfSubmissionValue(submissionPath, submission);

  if (value === undefined || (showAreaCode && (value.areaCode === undefined || value.number === undefined))) {
    return null;
  }

  const phoneNumber = showAreaCode ? `${value.areaCode} ${value.number}` : value;

  return {
    label: translate(label),
    verdi: phoneNumber,
  };
};

export default PdfPhoneNumber;
