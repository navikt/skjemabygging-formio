import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfSender = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission, translate } = props;
  const { senderRole, customLabels = {} } = component;
  const value = formComponentUtils.getPdfSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  const result: PdfData[] = [];

  if (senderRole === 'organization') {
    if (value.organization?.number) {
      result.push({ label: translate(customLabels.organizationNumber), verdi: value.organization.number });
    }
    if (value.organization?.name) {
      result.push({ label: translate(customLabels.organizationName), verdi: value.organization.name });
    }
  } else {
    if (value.person?.nationalIdentityNumber) {
      result.push({
        label: translate(customLabels.nationalIdentityNumber),
        verdi: value.person.nationalIdentityNumber,
      });
    }
    if (value.person?.firstName) {
      result.push({ label: translate(customLabels.firstName), verdi: value.person.firstName });
    }
    if (value.person?.surname) {
      result.push({ label: translate(customLabels.surname), verdi: value.person.surname });
    }
  }

  return result.length > 0 ? result : null;
};

export default PdfSender;
