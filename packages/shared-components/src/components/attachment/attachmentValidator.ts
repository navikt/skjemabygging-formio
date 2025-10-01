import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

interface AttachmentValidator {
  validate: (label: string, attachment?: SubmissionAttachment) => string | undefined;
}

type Rule = 'value' | 'fileUploaded' | 'otherDocumentationTitle';

const isValidValue = (attachment?: SubmissionAttachment) => !!attachment?.value;

const isFileUploaded = (attachment?: SubmissionAttachment) =>
  attachment?.value === 'leggerVedNaa' && (attachment.files ?? [])?.length === 0;

const isValidOtherAttachmentTitle = (attachment?: SubmissionAttachment) =>
  attachment?.type === 'other' && attachment.value === 'leggerVedNaa' && !attachment?.title;

const attachmentValidator = (
  translate: (text: string, params?: Record<string, string>) => string,
  rules: Rule[] = ['value', 'fileUploaded', 'otherDocumentationTitle'],
): AttachmentValidator => ({
  validate: (label: string, attachment?: SubmissionAttachment) => {
    if (rules.includes('value') && !isValidValue(attachment)) {
      return translate('required', { field: translate(label) });
    }
    if (rules.includes('fileUploaded') && !isFileUploaded(attachment)) {
      return translate('fileMissing', { field: translate(label) });
    }
    if (rules.includes('otherDocumentationTitle') && !isValidOtherAttachmentTitle(attachment)) {
      return translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) });
    }
    return undefined;
  },
});

export { attachmentValidator };
export type { AttachmentValidator };
