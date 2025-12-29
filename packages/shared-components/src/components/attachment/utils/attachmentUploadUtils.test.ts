import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe } from 'vitest';
import {
  filterAttachmentsByComponentId,
  findAttachmentByComponentId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
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
});
