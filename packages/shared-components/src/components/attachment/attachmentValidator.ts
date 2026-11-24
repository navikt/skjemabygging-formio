import { SubmissionAttachment, TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';

interface AttachmentValidator {
  validate: (
    label: string,
    attachment?: SubmissionAttachment,
    additionalDocumentationLabel?: string,
  ) => string | undefined;
}

type Rule =
  'value' | 'fileUploaded' | 'otherDocumentationTitle' | 'supportedAdditionalDocumentation' | 'supportedTitle';

const isValueValid = (attachment?: SubmissionAttachment) => !!attachment?.value;

const isFileUploadValid = (attachment?: SubmissionAttachment) =>
  attachment?.value !== 'leggerVedNaa' || (attachment.files ?? [])?.length > 0;

const isOtherAttachmentTitleValid = (attachment?: SubmissionAttachment) =>
  attachment?.type !== 'other' || attachment.value !== 'leggerVedNaa' || !!attachment?.title;

const attachmentValidator = (
  translate: (text: string, params?: Record<string, string>) => string,
  rules: Rule[] = ['value', 'fileUploaded', 'otherDocumentationTitle'],
): AttachmentValidator => ({
  validate: (label: string, attachment?: SubmissionAttachment, additionalDocumentationLabel?: string) => {
    if (rules.includes('value') && !isValueValid(attachment)) {
      return translate('required', { field: translate(label) });
    }
    if (rules.includes('fileUploaded') && !isFileUploadValid(attachment)) {
      return translate('fileMissing', { field: translate(label) });
    }
    if (rules.includes('otherDocumentationTitle') && !isOtherAttachmentTitleValid(attachment)) {
      return translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) });
    }
    if (
      rules.includes('supportedAdditionalDocumentation') &&
      attachment?.value &&
      !validatorUtils.hasSupportedCharacters(attachment.additionalDocumentation ?? '')
    ) {
      return translate('containsUnsupportedCharacters', {
        field: translate(additionalDocumentationLabel ?? label),
      });
    }
    if (
      rules.includes('supportedTitle') &&
      attachment?.type === 'other' &&
      attachment.value === 'leggerVedNaa' &&
      !validatorUtils.hasSupportedCharacters(attachment.title ?? '')
    ) {
      return translate('containsUnsupportedCharacters', {
        field: translate(TEXTS.statiske.attachment.attachmentTitle),
      });
    }
    return undefined;
  },
});

export { attachmentValidator };
export type { AttachmentValidator };
