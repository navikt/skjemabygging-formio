import { attachmentUtils, PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfAttachment = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission, translate, submissionMethod } = props;
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
      verdi: translate(attachmentUtils.getAttachmentLabel(value.key, submissionMethod)),
    },
    ...(comment ? [comment] : []),
  ];
};

export default PdfAttachment;
