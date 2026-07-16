import { FileObject } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

type AttachmentValidationRule = 'value' | 'fileUploaded' | 'otherDocumentationTitle';

const attachmentValidator = (
  translate: (text: string, params?: Record<string, string>) => string,
  rules: AttachmentValidationRule[] = ['value', 'fileUploaded', 'otherDocumentationTitle'],
) => ({
  validate: (label: string, attachment?: SubmissionAttachment) => {
    if (rules.includes('value') && !attachment?.value) {
      return translate('required', { field: translate(label) });
    }
    if (
      rules.includes('fileUploaded') &&
      attachment?.value === 'leggerVedNaa' &&
      (attachment.files ?? []).length === 0
    ) {
      return translate('fileMissing', { field: translate(label) });
    }
    if (
      rules.includes('otherDocumentationTitle') &&
      attachment?.type === 'other' &&
      attachment.value === 'leggerVedNaa' &&
      !attachment.title
    ) {
      return translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) });
    }
    return undefined;
  },
});

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

export { attachmentValidator, getFileValidationError, validateFileUpload, validateTotalFilesSize };
