import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfAttachment = ({ component, submissionPath, formContext, languagesContext }: PdfComponentProps) => {
  const { label } = component;
  const { translate } = languagesContext;
  const { submission } = formContext;
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
