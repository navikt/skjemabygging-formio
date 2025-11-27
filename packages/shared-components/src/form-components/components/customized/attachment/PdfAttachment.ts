import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps, PdfListElement } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfAttachment = (props: PdfComponentProps): PdfListElement => {
  const { component, submissionPath, submission, translate } = props;
  const { label, attachmentValues } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value.key) {
    return null;
  }

  const valueConfig = attachmentValues?.[value.key];
  const comment = valueConfig?.additionalDocumentation?.enabled
    ? {
        label: translate(valueConfig.additionalDocumentation.label),
        verdiliste: [{ label: value.additionalDocumentation || '' }],
        visningsVariant: 'PUNKTLISTE',
      }
    : null;

  return [
    {
      label: translate(label),
      verdi: translate(TEXTS.statiske.attachment[value.key]),
    },
    ...(comment ? [comment] : []),
  ];
};

export default PdfAttachment;
