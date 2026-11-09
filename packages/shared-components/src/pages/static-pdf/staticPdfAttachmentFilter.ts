import {
  Component,
  filterAttachmentsByCode,
  navFormUtils,
  normalizeAttachmentCodeFilter,
} from '@navikt/skjemadigitalisering-shared-domain';

const getFilteredStaticPdfAttachments = (components: Component[], filterValue: string | null | undefined) => {
  const attachments = navFormUtils.flattenComponents(components).filter((component) => component.type === 'attachment');
  return filterAttachmentsByCode(attachments, normalizeAttachmentCodeFilter(filterValue));
};

export {
  filterAttachmentsByCode as filterStaticPdfAttachments,
  getFilteredStaticPdfAttachments,
  normalizeAttachmentCodeFilter as normalizeStaticPdfAttachmentCodeFilter,
};
