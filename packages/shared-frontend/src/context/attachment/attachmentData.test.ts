import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { allocateAttachmentIds, clearAttachmentFiles, collectStoredAttachments } from './attachmentData';

const attachment: SubmissionAttachment = {
  attachmentId: 'doc-rows-1-documentation',
  navId: 'doc',
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
};

describe('generic attachment storage helpers', () => {
  it('allocates a new ID after a surviving row moved to a different index', () => {
    expect(allocateAttachmentIds(attachment, [attachment])).toEqual({
      ...attachment,
      attachmentId: 'doc-rows-1-documentation-1',
    });
    expect(allocateAttachmentIds([attachment, attachment], [attachment]).map((item) => item.attachmentId)).toEqual([
      'doc-rows-1-documentation-1',
      'doc-rows-1-documentation-2',
    ]);
  });

  it('collects all persisted attachments including unmatched legacy entries', () => {
    const legacy = { ...attachment, attachmentId: 'legacy' };
    const state = {
      data: { rows: [{ documentation: attachment }], other: [{ ...attachment, attachmentId: 'other' }] },
      attachments: [legacy],
    };
    expect(collectStoredAttachments(state).map((item) => item.attachmentId)).toEqual([
      'doc-rows-1-documentation',
      'other',
      'legacy',
    ]);
  });

  it('clears files without clearing the saved choices and preserves the original snapshot', () => {
    const state = { data: { documentation: { ...attachment, files: [{ fileId: 'file' }] } } };
    expect(clearAttachmentFiles(state).data.documentation).toEqual(attachment);
    expect(state.data.documentation.files).toHaveLength(1);
  });
});
