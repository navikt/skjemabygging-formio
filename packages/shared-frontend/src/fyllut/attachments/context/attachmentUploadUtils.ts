import type { AttachmentSettingValues, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';

const PDF_FILE_EXTENSION = '.pdf';
const PDF_MIME_TYPE = 'application/pdf';
const OCTET_STREAM_MIME_TYPE = 'application/octet-stream';
const DEFAULT_DOWNLOAD_FILE_NAME = 'attachment';

const filterAttachmentsByNavId = (submissionAttachments: SubmissionAttachment[], attachmentNavId: string) =>
  submissionAttachments.filter((attachment) => attachment.navId === attachmentNavId);

const getLargestAttachmentIdCounter = (attachments: SubmissionAttachment[]): number =>
  Math.max(
    0,
    ...attachments.map((attachment) => {
      const suffix = attachment.attachmentId.match(/-(\d+)$/)?.[1];
      return suffix ? Number.parseInt(suffix, 10) : 0;
    }),
  );

const getDefaultOtherAttachment = (
  attachmentNavId: string,
  value?: keyof AttachmentSettingValues,
): SubmissionAttachment => ({
  attachmentId: attachmentNavId,
  navId: attachmentNavId,
  type: 'other',
  ...(value ? { value } : {}),
});

const normalizeAttachmentDownloadFileName = (fileName: string): string => {
  const trimmedFileName = fileName.trim();
  const lastSeparatorIndex = Math.max(trimmedFileName.lastIndexOf('/'), trimmedFileName.lastIndexOf('\\'));
  const lastDotIndex = trimmedFileName.lastIndexOf('.');
  const hasExtension = lastDotIndex > lastSeparatorIndex && lastDotIndex < trimmedFileName.length - 1;
  let baseNameEnd = hasExtension ? lastDotIndex : trimmedFileName.length;

  while (baseNameEnd > 0 && trimmedFileName[baseNameEnd - 1] === '.') {
    baseNameEnd -= 1;
  }

  const fileNameWithoutExtension = trimmedFileName.slice(0, baseNameEnd);
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
  filterAttachmentsByNavId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
  normalizeAttachmentDownloadBlob,
  normalizeAttachmentDownloadFileName,
};
