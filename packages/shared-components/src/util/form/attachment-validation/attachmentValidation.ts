import { FileObject } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FrontendLogger from '../../../api/frontend-logger/FrontendLogger';

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
  logger?: FrontendLogger,
) => {
  const attachmentFilesSize = attachment?.files?.reduce((acc, file) => acc + file.size, 0) ?? 0;
  const additionalFilesSize = additionalFiles?.reduce((acc, file) => acc + file.size, 0) ?? 0;
  if (attachmentFilesSize + additionalFilesSize > totalMaxAttachmentSizeInBytes) {
    logger?.debug(
      `Total size for attachment exceeded when uploading file: ${attachmentFilesSize + additionalFilesSize} bytes`,
    );
    return TEXTS.statiske.uploadFile.totalFileSizeTooLarge;
  }
};

const validateFileUpload = (file: FileObject, logger?: FrontendLogger) => {
  if (file.error) {
    if (file.reasons.some((reason) => reason === 'fileSize')) {
      logger?.debug(
        `Uploading file failed because of file size. Size: ${file.file.size}, name: ${file.file.name}, type: ${file.file.type}`,
      );
      return TEXTS.statiske.uploadFile.fileTooLargeError;
    } else {
      logger?.debug(
        `Uploading file failed with reasons: ${file.reasons}. Size: ${file.file.size}, name: ${file.file.name}, type: ${file.file.type}`,
      );
      return TEXTS.statiske.uploadFile.fileNotSupportedError;
    }
  }
};

export { validateAttachmentFiles, validateAttachmentValues, validateFileUpload };
