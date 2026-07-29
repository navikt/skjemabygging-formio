import { FileObject } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES = 150 * 1024 * 1024;

const getFileValidationError = (file: FileObject): string | undefined => {
  if (!file.error) {
    return undefined;
  }

  switch (file.reasons[0]) {
    case 'fileSize':
      return TEXTS.statiske.uploadFile.fileTooLargeError;
    case 'fileType':
      return TEXTS.statiske.uploadFile.fileNotSupportedError;
    default:
      return file.reasons[0] ?? TEXTS.statiske.uploadFile.defaultFileError;
  }
};

export { getFileValidationError, MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES };
