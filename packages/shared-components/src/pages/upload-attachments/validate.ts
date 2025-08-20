import { TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

export const validateAttachments = (
  radioState: Record<string, string>,
  attachmentIds: string[],
  addError: (attachmentId: string, error: string) => void,
  uploadedFiles: UploadedFile[],
) => {
  attachmentIds.forEach((attachmentId: string) => {
    if (!radioState[attachmentId]) {
      addError(attachmentId, TEXTS.statiske.attachment.attachmentError);
    }
    if (
      radioState[attachmentId] &&
      radioState[attachmentId] === 'leggerVedNaa' &&
      !uploadedFiles.some((file) => file.attachmentId === attachmentId)
    ) {
      addError(attachmentId, TEXTS.statiske.attachment.attachmentError);
    }
  });
};
