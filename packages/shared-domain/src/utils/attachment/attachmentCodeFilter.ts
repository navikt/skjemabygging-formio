import { Component } from '../../models';

const normalizeAttachmentCodeFilter = (filter?: string | readonly string[] | null): string[] =>
  (typeof filter === 'string' ? filter : (filter ?? []).join(','))
    .split(',')
    .map((code) => code.trim())
    .filter((code) => code.length > 0);

const createAttachmentCodeFilter = (attachmentCodeFilter: readonly string[]) => {
  const allowedAttachmentCodes = new Set(attachmentCodeFilter);

  return (attachment: Component) => {
    if (allowedAttachmentCodes.size === 0) {
      return true;
    }

    const attachmentCode = attachment.properties?.vedleggskode?.trim();
    return !!attachmentCode && allowedAttachmentCodes.has(attachmentCode);
  };
};

const filterAttachmentsByCode = (attachments: Component[], attachmentCodeFilter: readonly string[]) => {
  if (attachmentCodeFilter.length === 0) {
    return attachments;
  }

  return attachments.filter(createAttachmentCodeFilter(attachmentCodeFilter));
};

export { createAttachmentCodeFilter, filterAttachmentsByCode, normalizeAttachmentCodeFilter };
