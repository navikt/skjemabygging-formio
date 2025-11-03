import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';

const PdfAttachmentUpload = ({ formContextValue, languagesContextValue, component }: PdfComponentProps) => {
  const { submission } = formContextValue;
  const { translate } = languagesContextValue;
  const { navId, label, attachmentValues, attachmentType, otherDocumentation } = component;

  if (!navId) {
    console.warn('PdfAttachmentUpload: navId is missing on component');
    return null;
  }

  const attachments = submission?.attachments ?? [];

  if (attachmentType === 'other' || otherDocumentation) {
    const filtered = attachments.filter((a) => a.attachmentId.startsWith(navId) && a.value);
    if (!filtered.length) return null;
    return {
      label: translate(label || 'Ukjent vedlegg'),
      verdiliste: filtered.map((a) => ({
        label: translate(a.title || 'Ukjent vedlegg'),
        verdiliste: [
          {
            label: translate(TEXTS.pdfStatiske.selectedAnswer),
            verdi: `${translate(TEXTS.statiske.attachment[a.value])}`,
          },
        ],
      })),
    };
  } else if (attachmentType === 'default' || !attachmentType) {
    const found = attachments.find((a) => a.attachmentId.startsWith(navId));
    if (!found || !found.value) return null;
    const commentRequired = attachmentValues?.[found.value]?.additionalDocumentation;
    return {
      label: translate(label || 'Ukjent vedlegg'),
      verdiliste: [
        {
          label: translate(TEXTS.pdfStatiske.selectedAnswer),
          verdi: `${translate(TEXTS.statiske.attachment[found.value])}`,
        },
        ...(commentRequired?.enabled
          ? [{ label: commentRequired.label, verdi: found.additionalDocumentation || '' }]
          : []),
      ],
    };
  }

  return null;
};

export default PdfAttachmentUpload;
