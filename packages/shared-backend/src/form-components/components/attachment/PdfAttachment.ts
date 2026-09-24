import { attachmentUtils, navFormUtils, PdfData, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const PdfAttachment = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission, translate, submissionMethod } = props;
  const attachmentUploadEnabled = attachmentUtils.enableAttachmentUpload(submissionMethod);
  const navId = navFormUtils.getNavId(component) ?? component.key;
  if (attachmentUploadEnabled && !navId) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'PdfAttachment: navId is required on digital attachment');
  }

  const { attachments } = attachmentUtils.resolveAttachmentsAtPath(
    component,
    submissionPath || component.key,
    submission,
  );

  if (attachmentUploadEnabled && (component.attachmentType === 'other' || component.otherDocumentation)) {
    const attachmentsWithValue = attachments.filter((attachment) => attachment.value);
    if (attachmentsWithValue.length === 0) {
      return null;
    }

    return attachmentsWithValue.map((attachment) => ({
      label: `${translate(component.label || 'Ukjent vedlegg')}${
        attachment.value === 'leggerVedNaa' ? ` - ${translate(attachment.title || 'Ukjent vedlegg')}` : ''
      }`,
      verdi: translate(attachmentUtils.getAttachmentLabel(attachment.value!, submissionMethod, component.values)),
    }));
  }

  const [attachment] = attachments;
  if (!attachment?.value) {
    return null;
  }

  const additionalDocumentation = component.attachmentValues?.[attachment.value]?.additionalDocumentation;

  return [
    {
      label: translate(component.label || 'Ukjent vedlegg'),
      verdi: translate(attachmentUtils.getAttachmentLabel(attachment.value, submissionMethod, component.values)),
    },
    ...(additionalDocumentation?.enabled
      ? [
          {
            label: translate(additionalDocumentation.label),
            verdiliste: [{ label: attachment.additionalDocumentation || '' }],
            visningsVariant: 'PUNKTLISTE',
          } satisfies PdfData,
        ]
      : []),
  ];
};

export default PdfAttachment;
