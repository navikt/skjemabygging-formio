import type { FileObject } from '@navikt/ds-react';
import { TEXTS, type UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

const validateTotalFilesSize = (totalMaxAttachmentSizeInBytes: number, files: Array<File | UploadedFile>) => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0) ?? 0;
  if (totalSize > totalMaxAttachmentSizeInBytes) {
    return TEXTS.statiske.uploadFile.totalFileSizeTooLarge;
  }
};

const validateFileUpload = (file: FileObject) => {
  if (!file.error) {
    return undefined;
  }

  if (file.reasons.some((reason) => reason === 'fileSize')) {
    return TEXTS.statiske.uploadFile.fileTooLargeError;
  }

  return TEXTS.statiske.uploadFile.fileNotSupportedError;
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
    default:
      return mainReason ?? TEXTS.statiske.uploadFile.defaultFileError;
  }
};

export { getFileValidationError, validateFileUpload, validateTotalFilesSize };
