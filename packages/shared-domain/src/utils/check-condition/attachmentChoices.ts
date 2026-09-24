import { SubmissionAttachment } from '../../models';

const isAttachment = (value: unknown): value is SubmissionAttachment =>
  !!value && typeof value === 'object' && 'attachmentId' in value && 'navId' in value && 'type' in value;

/**
 * Legacy authored conditions read `.key`, including on "other documentation" answers.
 * Expose those aliases only in the evaluation view; persisted data keeps its canonical shape.
 */
const withAttachmentChoices = <T>(value: T): T => {
  if (isAttachment(value)) return { ...value, key: value.value };
  if (Array.isArray(value)) {
    const items = value.map(withAttachmentChoices);
    const first = value[0];
    if (isAttachment(first) && value.every(isAttachment)) {
      Object.assign(items, {
        key: first.value,
        value: first.value,
        additionalDocumentation: first.additionalDocumentation,
      });
      return items as T;
    }
    return items.some((item, index) => item !== value[index]) ? (items as T) : value;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    const next = entries.map(([key, item]) => [key, withAttachmentChoices(item)] as const);
    return next.some(([, item], index) => item !== entries[index][1]) ? (Object.fromEntries(next) as T) : value;
  }
  return value;
};

const attachmentChoiceValue = (value: unknown): unknown =>
  isAttachment(value) ? value.value : Array.isArray(value) ? value.map(attachmentChoiceValue) : value;

export { attachmentChoiceValue, withAttachmentChoices };
