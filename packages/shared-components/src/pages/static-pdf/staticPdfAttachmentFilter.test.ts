import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { filterStaticPdfAttachments, normalizeStaticPdfAttachmentCodeFilter } from './staticPdfAttachmentFilter';

const createAttachment = (key: string, vedleggskode: string) =>
  ({
    key,
    label: key,
    type: 'attachment',
    properties: { vedleggskode },
  }) as Component;

describe('staticPdfAttachmentFilter', () => {
  describe('normalizeStaticPdfAttachmentCodeFilter', () => {
    it('returns an empty array when the filter is missing', () => {
      expect(normalizeStaticPdfAttachmentCodeFilter(undefined)).toEqual([]);
      expect(normalizeStaticPdfAttachmentCodeFilter(null)).toEqual([]);
    });

    it('returns an empty array when the filter is empty after trimming', () => {
      expect(normalizeStaticPdfAttachmentCodeFilter('')).toEqual([]);
      expect(normalizeStaticPdfAttachmentCodeFilter(' ,  , ')).toEqual([]);
    });

    it('trims whitespace and ignores empty values', () => {
      expect(normalizeStaticPdfAttachmentCodeFilter(' R4 , , K2 ')).toEqual(['R4', 'K2']);
    });
  });

  describe('filterStaticPdfAttachments', () => {
    const attachments = [createAttachment('vedlegg1', 'R4'), createAttachment('vedlegg2', 'K2')];

    it('returns all attachments when there is no active filter', () => {
      expect(filterStaticPdfAttachments(attachments, [])).toEqual(attachments);
    });

    it('returns only attachments with matching vedleggskode values', () => {
      expect(filterStaticPdfAttachments(attachments, ['R4'])).toEqual([attachments[0]]);
      expect(filterStaticPdfAttachments(attachments, ['R4', 'K2'])).toEqual([attachments[0], attachments[1]]);
    });

    it('ignores unknown codes when a filter is present', () => {
      expect(filterStaticPdfAttachments(attachments, ['R4', 'ZZ'])).toEqual([attachments[0]]);
      expect(filterStaticPdfAttachments(attachments, ['ZZ'])).toEqual([]);
    });
  });
});
