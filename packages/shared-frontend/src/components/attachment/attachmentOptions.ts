import { AttachmentOption, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';

interface AttachmentChoiceOption extends AttachmentOption {
  description?: string;
  showDeadline?: boolean;
}

type AttachmentChoice = Pick<SubmissionAttachment, 'value' | 'additionalDocumentation'>;

const getImplicitAttachmentValue = (values: AttachmentChoiceOption[], uploadEnabled: boolean) =>
  uploadEnabled && values.length === 1 && values[0].upload ? values[0].value : undefined;

export { getImplicitAttachmentValue };
export type { AttachmentChoice, AttachmentChoiceOption };
