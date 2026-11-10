import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';

const isSubmissionAttachment = (value: unknown): value is SubmissionAttachment =>
  typeof value === 'object' &&
  value !== null &&
  'attachmentId' in value &&
  typeof value.attachmentId === 'string' &&
  'navId' in value &&
  typeof value.navId === 'string' &&
  'type' in value &&
  typeof value.type === 'string';

const createAttachmentId = (navId: string, statePath: string) =>
  statePath.includes('[') ? `${navId}-${statePath.replace(/[^a-zA-Z0-9_-]+/g, '-')}` : navId;

const collectStoredAttachments = (value: unknown): SubmissionAttachment[] => {
  if (isSubmissionAttachment(value)) return [value];
  if (Array.isArray(value)) return value.flatMap(collectStoredAttachments);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStoredAttachments);
  return [];
};

const allocateAttachmentIds = <T extends SubmissionAttachment | SubmissionAttachment[]>(
  value: T,
  existing: SubmissionAttachment[],
): T => {
  const usedIds = new Set(existing.map((attachment) => attachment.attachmentId));
  const allocate = (attachment: SubmissionAttachment): SubmissionAttachment => {
    let id = attachment.attachmentId;
    let suffix = 0;
    while (usedIds.has(id)) id = `${attachment.attachmentId}-${++suffix}`;
    usedIds.add(id);
    return id === attachment.attachmentId ? attachment : { ...attachment, attachmentId: id };
  };
  return (Array.isArray(value) ? value.map(allocate) : allocate(value)) as T;
};

const clearAttachmentFiles = <T>(value: T): T => {
  if (isSubmissionAttachment(value)) return { ...value, files: [] };
  if (Array.isArray(value)) return value.map(clearAttachmentFiles) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, clearAttachmentFiles(entry)])) as T;
  }
  return value;
};

export {
  allocateAttachmentIds,
  clearAttachmentFiles,
  collectStoredAttachments,
  createAttachmentId,
  isSubmissionAttachment,
};
