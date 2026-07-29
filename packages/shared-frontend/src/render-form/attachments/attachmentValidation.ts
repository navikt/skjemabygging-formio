import { AttachmentSettingValues, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const attachmentValidator = (
  translate: (text: string, params?: Record<string, string>) => string,
  rules: Array<'value' | 'fileUploaded' | 'otherDocumentationTitle'> = [
    'value',
    'fileUploaded',
    'otherDocumentationTitle',
  ],
) => ({
  validate: (label: string, attachment?: SubmissionAttachment) => {
    if (rules.includes('value') && !attachment?.value) {
      return translate('required', { field: translate(label) });
    }
    if (rules.includes('fileUploaded') && attachment?.value === 'leggerVedNaa' && !attachment.files?.length) {
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

const attachmentFromId = (componentId: string, value?: keyof AttachmentSettingValues): SubmissionAttachment => ({
  attachmentId: componentId,
  navId: componentId,
  type: 'other',
  ...(value ? { value } : {}),
});

export { attachmentFromId, attachmentValidator };
