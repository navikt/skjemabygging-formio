import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

interface Validator<Target> {
  validate: (label: string, target?: Target) => string | undefined;
}

const validateValue = (attachment?: SubmissionAttachment) => {
  if (!attachment?.value) {
    return 'required';
  }
  if (attachment?.value && attachment.value === 'leggerVedNaa' && (attachment.files ?? [])?.length === 0) {
    return 'fileMissing';
  }
};

const validateOtherDocumentationTitle = (attachment?: SubmissionAttachment) =>
  attachment?.type === 'other' && attachment.value === 'leggerVedNaa' && !attachment?.additionalDocumentationTitle;

const attachmentValidator = (
  translate: (text: string, params?: Record<string, string>) => string,
): Validator<SubmissionAttachment> => ({
  validate: (label: string, attachment?: SubmissionAttachment) => {
    const valueError = validateValue(attachment);
    if (valueError) {
      return translate(valueError, { field: translate(label) });
    }
    console.log('Validate att', attachment);
    if (validateOtherDocumentationTitle(attachment)) {
      return translate('required', { label: translate(TEXTS.statiske.attachment.descriptionLabel) });
    }

    return undefined;
  },
});

export type AttachmentValidator = Validator<SubmissionAttachment>;
export { attachmentValidator };
