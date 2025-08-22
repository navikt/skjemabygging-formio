import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

export const validateAttachments = (
  attachments: SubmissionAttachment[],
  attachmentIds: string[],
): Record<string, string> => {
  const errors: Record<string, string> = {};
  attachmentIds.forEach((attachmentId: string) => {
    const attachment = attachments.find((att) => att.attachmentId === attachmentId);
    if (!attachment?.value) {
      errors[attachmentId] = TEXTS.statiske.attachment.attachmentError;
    }
    if (attachment?.value && attachment.value === 'leggerVedNaa' && (attachment.files ?? [])?.length === 0) {
      errors[attachmentId] = TEXTS.statiske.attachment.attachmentError;
    }
  });
  return errors;
};
