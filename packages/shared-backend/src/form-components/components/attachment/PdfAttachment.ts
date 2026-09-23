import {
  attachmentUtils,
  navFormUtils,
  PdfData,
  ResponseError,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const isStructuredAttachmentValue = (value: unknown): boolean =>
  (typeof value === 'object' && value !== null && 'attachmentId' in value) ||
  (Array.isArray(value) && value.some((item) => typeof item === 'object' && item !== null && 'attachmentId' in item));

const createAttachmentId = (navId: string, submissionPath: string): string =>
  submissionPath.includes('[') ? `${navId}-${submissionPath.replace(/[^a-zA-Z0-9_-]+/g, '-')}` : navId;

const belongsToAttachmentId = (attachmentId: string, baseAttachmentId: string): boolean =>
  attachmentId === baseAttachmentId ||
  (attachmentId.startsWith(`${baseAttachmentId}-`) && /^\d+$/.test(attachmentId.slice(baseAttachmentId.length + 1)));

const PdfAttachment = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission, translate, submissionMethod } = props;
  const attachmentUploadEnabled = attachmentUtils.enableAttachmentUpload(submissionMethod);
  const navId = navFormUtils.getNavId(component) ?? component.key;
  if (attachmentUploadEnabled && !navId) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'PdfAttachment: navId is required on digital attachment');
  }

  const resolvedSubmissionPath = submissionPath || component.key;
  const pathValue = submissionUtils.getSubmissionValue(resolvedSubmissionPath, submission);
  const dataAttachments = attachmentUtils.toSubmissionAttachments(pathValue, component);
  const resolvedAttachments = (submission?.attachments ?? []).filter((attachment) => attachment.navId === navId);
  const rowAttachmentId = createAttachmentId(navId, resolvedSubmissionPath);
  // A shared navId cannot identify a datagrid row. Without a scoped ID, use only that row's data.
  const attachmentsFromTopLevelStorage = resolvedSubmissionPath.includes('[')
    ? resolvedAttachments.filter((attachment) => belongsToAttachmentId(attachment.attachmentId, rowAttachmentId))
    : resolvedAttachments;
  const attachments = isStructuredAttachmentValue(pathValue)
    ? dataAttachments
    : attachmentsFromTopLevelStorage.length > 0
      ? attachmentsFromTopLevelStorage
      : dataAttachments;

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
