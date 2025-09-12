import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';

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

const attachmentValidator = (
  translate: (text: string, params?: Record<string, string>) => string,
): Validator<SubmissionAttachment> => ({
  validate: (label: string, attachment?: SubmissionAttachment) => {
    const valueError = validateValue(attachment);
    if (valueError) {
      return translate(valueError, { field: translate(label) });
    }

    return undefined;
  },
});

export type AttachmentValidator = Validator<SubmissionAttachment>;
export { attachmentValidator };
