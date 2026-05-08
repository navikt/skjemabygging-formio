import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe } from 'vitest';
import {
  filterAttachmentsByComponentId,
  findAttachmentByComponentId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
  normalizeAttachmentDownloadBlob,
  normalizeAttachmentDownloadFileName,
} from './attachmentUploadUtils';

describe('attachmentUploadUtils', () => {
  describe('findAttachmentByComponentId', () => {
    it('finds nothing when attachments is empty', () => {
      const attachments: SubmissionAttachment[] = [];
      const result = findAttachmentByComponentId(attachments, 'comp1');
      expect(result).toBeUndefined();
    });

    it('should find attachment with no suffix by componentId', () => {
      const attachments: SubmissionAttachment[] = [
        { attachmentId: 'comp1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp2-1', navId: 'comp2', type: 'other' },
      ];
      const result = findAttachmentByComponentId(attachments, 'comp1');
      expect(result).toEqual({ attachmentId: 'comp1', navId: 'comp1', type: 'other' });
    });

    it('should find attachment with suffix by componentId', () => {
      const attachments: SubmissionAttachment[] = [
        { attachmentId: 'comp1-1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-2', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp2-1', navId: 'comp2', type: 'other' },
      ];
      const result = findAttachmentByComponentId(attachments, 'comp1');
      expect(result).toEqual({ attachmentId: 'comp1-1', navId: 'comp1', type: 'other' });
    });
  });

  describe('findAttachmentByAttachmentId', () => {
    it('finds nothing when attachments is empty', () => {
      const attachments: SubmissionAttachment[] = [];
      const result = findAttachmentByComponentId(attachments, 'comp1-1');
      expect(result).toBeUndefined();
    });

    it('should find attachment by exact attachmentId', () => {
      const attachments: SubmissionAttachment[] = [
        { attachmentId: 'comp1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp2-1', navId: 'comp2', type: 'other' },
      ];
      const result = findAttachmentByComponentId(attachments, 'comp1-1');
      expect(result).toEqual({ attachmentId: 'comp1-1', navId: 'comp1', type: 'other' });
    });

    it('should return undefined when no attachment matches attachmentId', () => {
      const attachments: SubmissionAttachment[] = [
        { attachmentId: 'comp1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp2-1', navId: 'comp2', type: 'other' },
      ];
      const result = findAttachmentByComponentId(attachments, 'comp1-2');
      expect(result).toBeUndefined();
    });
  });

  describe('filterAttachmentsByComponentId', () => {
    it('returns empty array when attachments is empty', () => {
      const attachments: SubmissionAttachment[] = [];
      const result = filterAttachmentsByComponentId(attachments, 'comp1');
      expect(result).toEqual([]);
    });

    it('returns empty array when no attachments match componentId', () => {
      const attachments: SubmissionAttachment[] = [
        { attachmentId: 'comp2-1', navId: 'comp2', type: 'other' },
        { attachmentId: 'comp3-1', navId: 'comp3', type: 'other' },
      ];
      const result = filterAttachmentsByComponentId(attachments, 'comp1');
      expect(result).toEqual([]);
    });

    it('returns all attachments that match componentId', () => {
      const attachments: SubmissionAttachment[] = [
        { attachmentId: 'comp1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp2-1', navId: 'comp2', type: 'other' },
      ];
      const result = filterAttachmentsByComponentId(attachments, 'comp1');
      expect(result).toEqual([
        { attachmentId: 'comp1', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-1', navId: 'comp1', type: 'other' },
      ]);
    });
  });

  describe('getLargestAttachmentIdCounter', () => {
    it('returns 0 when attachments is empty', () => {
      const attachments: SubmissionAttachment[] = [];
      const result = getLargestAttachmentIdCounter(attachments);
      expect(result).toBe(0);
    });

    it('returns 0 when no attachments have a counter', () => {
      const attachments: SubmissionAttachment[] = [{ attachmentId: 'comp1', navId: 'comp1', type: 'other' }];
      const result = getLargestAttachmentIdCounter(attachments);
      expect(result).toBe(0);
    });

    it('returns the largest counter from attachmentIds', () => {
      const attachments: SubmissionAttachment[] = [
        { attachmentId: 'comp1-2', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-5', navId: 'comp1', type: 'other' },
        { attachmentId: 'comp1-3', navId: 'comp1', type: 'other' },
      ];
      const result = getLargestAttachmentIdCounter(attachments);
      expect(result).toBe(5);
    });
  });

  describe('getDefaultOtherAttachment', () => {
    const componentId = 'comp1';

    it('returns default other attachment from componentId', () => {
      const result = getDefaultOtherAttachment(componentId);
      expect(result).toEqual({
        attachmentId: componentId,
        navId: componentId,
        type: 'other',
      });
    });

    it('returns default other attachment from componentId and value', () => {
      const value = 'leggerVedNaa';
      const result = getDefaultOtherAttachment(componentId, value);
      expect(result).toEqual({
        attachmentId: componentId,
        navId: componentId,
        type: 'other',
        value: value,
      });
    });
  });

  describe('normalizeAttachmentDownloadFileName', () => {
    it('adds .pdf when file has no extension', () => {
      const result = normalizeAttachmentDownloadFileName('receipt');
      expect(result).toBe('receipt.pdf');
    });

    it('changes existing extension to .pdf', () => {
      const result = normalizeAttachmentDownloadFileName('receipt.jpg');
      expect(result).toBe('receipt.pdf');
    });

    it('keeps .pdf extension and normalizes casing', () => {
      const result = normalizeAttachmentDownloadFileName('receipt.PDF');
      expect(result).toBe('receipt.pdf');
    });

    it('uses fallback filename for blank values', () => {
      const result = normalizeAttachmentDownloadFileName('   ');
      expect(result).toBe('attachment.pdf');
    });
  });

  describe('normalizeAttachmentDownloadBlob', () => {
    it('keeps pdf blob unchanged', () => {
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/pdf' });
      const result = normalizeAttachmentDownloadBlob(blob);
      expect(result).toBe(blob);
      expect(result.type).toBe('application/pdf');
    });

    it('converts octet-stream blob to pdf blob type', () => {
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/octet-stream' });
      const result = normalizeAttachmentDownloadBlob(blob);
      expect(result).not.toBe(blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBe(blob.size);
    });

    it('converts blob without type to pdf blob type', () => {
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: '' });
      const result = normalizeAttachmentDownloadBlob(blob);
      expect(result).not.toBe(blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBe(blob.size);
    });

    it('keeps non-octet-stream non-pdf blob unchanged', () => {
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' });
      const result = normalizeAttachmentDownloadBlob(blob);
      expect(result).toBe(blob);
      expect(result.type).toBe('image/jpeg');
    });
  });
});
