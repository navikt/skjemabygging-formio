import { attachmentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';

const PdfAttachmentUpload = (props: PdfComponentProps) => {
  const { component, submission, translate, submissionMethod } = props;
  const { navId, label, attachmentValues, attachmentType, otherDocumentation } = component;

  if (!navId) {
    throw Error('PdfAttachmentUpload: navId is required on component');
  }

  const attachments = submission?.attachments ?? [];

  if (attachmentType === 'other' || otherDocumentation) {
    const filtered = attachments.filter((a) => a.attachmentId.startsWith(navId) && a.value);
    if (!filtered.length) return null;
    return filtered.map((a) => ({
      label: `${translate(label || 'Ukjent vedlegg')}${a.value === 'leggerVedNaa' ? ` - ${translate(a.title || 'Ukjent vedlegg')}` : ''}`,
      verdi: translate(attachmentUtils.getAttachmentOptionLabel(a.value!, submissionMethod)),
    }));
  } else if (attachmentType === 'default' || !attachmentType) {
    const found = attachments.find((a) => a.attachmentId.startsWith(navId));
    if (!found || !found.value) return null;
    const commentRequired = attachmentValues?.[found.value]?.additionalDocumentation;
    return [
      {
        label: translate(label || 'Ukjent vedlegg'),
        verdi: `${translate(attachmentUtils.getAttachmentOptionLabel(found.value, submissionMethod))}`,
      },
      ...(commentRequired?.enabled
        ? [
            {
              label: translate(commentRequired.label),
              verdiliste: [{ label: `${found.additionalDocumentation || ''}` }],
              visningsVariant: 'PUNKTLISTE',
            },
          ]
        : []),
    ];
  }

  return null;
};

export default PdfAttachmentUpload;
