import { FileObject } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import FrontendLogger from '../../../api/frontend-logger/FrontendLogger';
import { AttachmentValidator } from '../../../components/attachment/attachmentValidator';
import { Attachment } from '../../attachment/attachmentsUtil';

const validateAttachment = (
  formAttachments: Attachment[],
  submissionAttachments: SubmissionAttachment[],
  validator: AttachmentValidator,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  formAttachments.forEach(({ label, navId }) => {
    const submissionAttachment = submissionAttachments.find((att) => att.attachmentId.startsWith(navId!));
    const error = validator.validate(label, submissionAttachment);
    if (error) {
      errors[navId!] = error;
    }
  });
  return errors;
};

const validateTotalFilesSize = (
  totalMaxAttachmentSizeInBytes: number,
  files: Array<File | UploadedFile>,
  logger?: FrontendLogger,
) => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0) ?? 0;
  if (totalSize > totalMaxAttachmentSizeInBytes) {
    logger?.info(`Total size for attachment exceeded when uploading file: ${totalSize} bytes`);
    return TEXTS.statiske.uploadFile.totalFileSizeTooLarge;
  }
};

const validateFileUpload = (file: FileObject, logger?: FrontendLogger) => {
  if (file.error) {
    if (file.reasons.some((reason) => reason === 'fileSize')) {
      logger?.info(
        `Uploading file failed because of file size. Size: ${file.file.size}, name: ${file.file.name}, type: ${file.file.type}`,
      );
      return TEXTS.statiske.uploadFile.fileTooLargeError;
    } else {
      logger?.info(
        `Uploading file failed with reasons: ${file.reasons}. Size: ${file.file.size}, name: ${file.file.name}, type: ${file.file.type}`,
      );
      return TEXTS.statiske.uploadFile.fileNotSupportedError;
    }
  }
};

const getFileValidationError = (file: FileObject): string | undefined => {
  if (!file.error) {
    return undefined;
  }
  const mainReason = file.reasons[0];
  switch (mainReason) {
    case 'fileSize':
      return TEXTS.statiske.uploadFile.fileTooLargeError;
    case 'fileType':
      return TEXTS.statiske.uploadFile.fileNotSupportedError;
    case 'uploadHttpError':
      return TEXTS.statiske.uploadFile.uploadFileError;
    case 'uploadTooManyPages':
      return TEXTS.statiske.uploadFile.uploadFileToManyPagesError;
    default:
      return TEXTS.statiske.uploadFile.defaultFileError;
  }
};

export { getFileValidationError, validateAttachment, validateFileUpload, validateTotalFilesSize };
