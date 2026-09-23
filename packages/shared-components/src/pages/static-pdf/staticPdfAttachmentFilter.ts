import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';

const normalizeStaticPdfAttachmentCodeFilter = (filterValue: string | null | undefined) => {
  if (!filterValue) {
    return [];
  }

  return filterValue
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
};

const filterStaticPdfAttachments = (attachments: Component[], attachmentCodeFilter: string[]) => {
  if (attachmentCodeFilter.length === 0) {
    return attachments;
  }

  const allowedAttachmentCodes = new Set(attachmentCodeFilter);

  return attachments.filter((attachment) => {
    const attachmentCode = attachment.properties?.vedleggskode?.trim();
    return !!attachmentCode && allowedAttachmentCodes.has(attachmentCode);
  });
};

const getFilteredStaticPdfAttachments = (components: Component[], filterValue: string | null | undefined) => {
  const attachments = navFormUtils.flattenComponents(components).filter((component) => component.type === 'attachment');
  return filterStaticPdfAttachments(attachments, normalizeStaticPdfAttachmentCodeFilter(filterValue));
};

export { filterStaticPdfAttachments, getFilteredStaticPdfAttachments, normalizeStaticPdfAttachmentCodeFilter };
