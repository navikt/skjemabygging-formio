import { AttachmentSettingValues, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';

const PDF_FILE_EXTENSION = '.pdf';
const PDF_MIME_TYPE = 'application/pdf';
const OCTET_STREAM_MIME_TYPE = 'application/octet-stream';
const DEFAULT_DOWNLOAD_FILE_NAME = 'attachment';

const findAttachmentByComponentId = (submissionAttachments: SubmissionAttachment[], componentId: string) =>
  submissionAttachments.find((attachment) => attachment.attachmentId.startsWith(componentId));

const findAttachmentByAttachmentId = (submissionAttachments: SubmissionAttachment[], attachmentId: string) =>
  submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);

const filterAttachmentsByComponentId = (submissionAttachments: SubmissionAttachment[], componentId: string) =>
  submissionAttachments.filter((attachment) => attachment.attachmentId.startsWith(componentId));

const getLargestAttachmentIdCounter = (attachments: SubmissionAttachment[]): number =>
  Math.max(0, ...attachments.map((attachment) => parseInt(attachment.attachmentId.split('-')[1] ?? 0)));

const getDefaultOtherAttachment = (
  componentId: string,
  value?: keyof AttachmentSettingValues,
): SubmissionAttachment => ({
  attachmentId: componentId,
  navId: componentId,
  type: 'other',
  ...(value ? { value } : {}),
});

const normalizeAttachmentDownloadFileName = (fileName: string): string => {
  const trimmedFileName = fileName.trim();
  const fileNameWithoutExtension = trimmedFileName.replace(/\.[^./\\]+$/u, '').replace(/\.+$/u, '');
  const normalizedFileName = fileNameWithoutExtension || DEFAULT_DOWNLOAD_FILE_NAME;
  return `${normalizedFileName}${PDF_FILE_EXTENSION}`;
};

const normalizeAttachmentDownloadBlob = (blob: Blob): Blob => {
  const blobType = blob.type.toLowerCase();
  if (blobType.startsWith(PDF_MIME_TYPE)) {
    return blob;
  }

  if (!blobType || blobType.startsWith(OCTET_STREAM_MIME_TYPE)) {
    return new Blob([blob], { type: PDF_MIME_TYPE });
  }

  return blob;
};

export {
  filterAttachmentsByComponentId,
  findAttachmentByAttachmentId,
  findAttachmentByComponentId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
  normalizeAttachmentDownloadBlob,
  normalizeAttachmentDownloadFileName,
};
