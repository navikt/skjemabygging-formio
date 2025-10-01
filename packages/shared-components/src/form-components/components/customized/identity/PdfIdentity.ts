import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import { getIdentityLabel, getIdentityValue } from './identityUtils';

const PdfIdentity = ({ submissionPath, formContext, languagesContext }: PdfComponentProps) => {
  const { translate } = languagesContext;
  const { submission } = formContext;

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
