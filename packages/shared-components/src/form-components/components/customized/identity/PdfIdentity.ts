import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import { getIdentityLabel } from './identityUtils';

const PdfIdentity = ({ submissionPath }: PdfComponentProps) => {
  const { translate } = useLanguages();
  const { submission } = useForm();

  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return {
    label: translate(getIdentityLabel(value)),
    verdi: value,
  };
};

export default PdfIdentity;
