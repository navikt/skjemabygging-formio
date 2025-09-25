import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfAttachment = ({ component, submissionPath }: PdfComponentProps) => {
  const { label } = component;
  const { translate } = useLanguages();
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value.key) {
    return null;
  }

  return {
    label: translate(label),
    verdi: translate(TEXTS.statiske.attachment[value.key]),
  };
};

export default PdfAttachment;
