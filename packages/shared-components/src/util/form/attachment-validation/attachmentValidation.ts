import { FileObject } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const validateAttachmentValues = (attachments: SubmissionAttachment[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  attachments.forEach((attachment: SubmissionAttachment) => {
    if (!attachment?.value) {
      errors[attachment.attachmentId] = TEXTS.statiske.attachment.attachmentError;
    }
    if (attachment?.value && attachment.value === 'leggerVedNaa' && (attachment.files ?? [])?.length === 0) {
      errors[attachment.attachmentId] = TEXTS.statiske.attachment.attachmentError;
    }
  });
  return errors;
};

const validateAttachmentFiles = (
  totalMaxAttachmentSizeInBytes: number,
  attachment?: SubmissionAttachment,
  additionalFiles?: File[],
) => {
  const attachmentFilesSize = attachment?.files?.reduce((acc, file) => acc + file.size, 0) ?? 0;
  const additionalFilesSize = additionalFiles?.reduce((acc, file) => acc + file.size, 0) ?? 0;
  if (attachmentFilesSize + additionalFilesSize > totalMaxAttachmentSizeInBytes) {
    return TEXTS.statiske.uploadFile.totalFileSizeTooLarge;
  }
};

const validateFileUpload = (file: FileObject) => {
  if (file.error) {
    return file.reasons[0] === 'fileSize'
      ? TEXTS.statiske.uploadFile.fileTooLargeError
      : TEXTS.statiske.uploadFile.fileNotSupportedError;
  }
};

export { validateAttachmentFiles, validateAttachmentValues, validateFileUpload };
