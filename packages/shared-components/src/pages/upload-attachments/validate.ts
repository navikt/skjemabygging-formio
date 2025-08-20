import { TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

export const validateAttachments = (
  radioState: Record<string, string>,
  attachmentIds: string[],
  uploadedFiles: UploadedFile[],
): Record<string, string> => {
  const errors: Record<string, string> = {};
  attachmentIds.forEach((attachmentId: string) => {
    if (!radioState[attachmentId]) {
      errors[attachmentId] = TEXTS.statiske.attachment.attachmentError;
    }
    if (
      radioState[attachmentId] &&
      radioState[attachmentId] === 'leggerVedNaa' &&
      !uploadedFiles.some((file) => file.attachmentId === attachmentId)
    ) {
      errors[attachmentId] = TEXTS.statiske.attachment.attachmentError;
    }
  });
  return errors;
};
