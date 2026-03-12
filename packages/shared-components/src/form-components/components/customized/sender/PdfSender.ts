import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfSender = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission, translate } = props;
  const { senderRole, labels = {} } = component;
  const value = formComponentUtils.getPdfSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  const result: PdfData[] = [];

  if (senderRole === 'organization') {
    if (value.organizationNumber) {
      result.push({ label: translate(labels.organizationNumber), verdi: value.organizationNumber });
    }
    if (value.organizationName) {
      result.push({ label: translate(labels.organizationName), verdi: value.organizationName });
    }
  } else {
    if (value.nationalIdentityNumber) {
      result.push({ label: translate(labels.nationalIdentityNumber), verdi: value.nationalIdentityNumber });
    }
    if (value.firstName) {
      result.push({ label: translate(labels.firstName), verdi: value.firstName });
    }
    if (value.surname) {
      result.push({ label: translate(labels.surname), verdi: value.surname });
    }
  }

  return result.length > 0 ? result : null;
};

export default PdfSender;
