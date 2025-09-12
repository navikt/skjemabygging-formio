import { FileObject } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
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

const validateAttachmentFiles = (
  totalMaxAttachmentSizeInBytes: number,
  attachment?: SubmissionAttachment,
  additionalFiles?: File[],
  logger?: FrontendLogger,
) => {
  const attachmentFilesSize = attachment?.files?.reduce((acc, file) => acc + file.size, 0) ?? 0;
  const additionalFilesSize = additionalFiles?.reduce((acc, file) => acc + file.size, 0) ?? 0;
  if (attachmentFilesSize + additionalFilesSize > totalMaxAttachmentSizeInBytes) {
    logger?.info(
      `Total size for attachment exceeded when uploading file: ${attachmentFilesSize + additionalFilesSize} bytes`,
    );
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

export { validateAttachment, validateAttachmentFiles, validateFileUpload };
