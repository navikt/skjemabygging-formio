import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import { getIdentityLabel, getIdentityValue } from './identityUtils';

const PdfIdentity = (props: PdfComponentProps) => {
  const { submissionPath, submission, translate } = props;

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return {
    label: translate(getIdentityLabel(value)),
    verdi: getIdentityValue(value, false),
  };
};

export default PdfIdentity;
