import { Form, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import {
  createAttachmentId,
  getAttachmentsAtPath,
  hydrateLegacyAttachments,
  setAttachmentsAtPath,
} from './attachmentData';

const attachment: SubmissionAttachment = {
  attachmentId: 'documentation',
  navId: 'documentation-nav-id',
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
};

describe('attachmentData', () => {
  it('uses the navId unless the attachment is inside a repeated row', () => {
    expect(createAttachmentId('documentation-nav-id', 'container.documentation')).toBe('documentation-nav-id');
    expect(createAttachmentId('documentation-nav-id', 'rows[0].documentation')).toBe(
      'documentation-nav-id-rows-0-documentation',
    );
  });

  it('stores and reads attachments at nested paths', () => {
    const submission = setAttachmentsAtPath({ data: {} }, 'container.rows[0].documentation', [attachment], false);

    expect(getAttachmentsAtPath(submission, 'container.rows[0].documentation')).toEqual([attachment]);
  });

  it('hydrates legacy form attachments and retains personal ID separately', () => {
    const personalId: SubmissionAttachment = {
      attachmentId: 'personal-id',
      navId: 'personal-id',
      type: 'personal-id',
      files: [],
    };
    const form = {
      components: [
        {
          key: 'attachments',
          label: 'Attachments',
          type: 'panel',
          components: [
            {
              key: 'documentation',
              label: 'Documentation',
              navId: 'documentation-nav-id',
              type: 'attachment',
            },
          ],
        },
      ],
    } as Form;

    expect(hydrateLegacyAttachments(form, { data: {}, attachments: [attachment, personalId] })).toEqual({
      data: { documentation: attachment },
      attachments: [personalId],
    });
  });

  it('hydrates a legacy attachment into the first datagrid row without replacing existing rows', () => {
    const form = {
      components: [
        {
          key: 'rows',
          type: 'datagrid',
          input: true,
          components: [
            {
              key: 'documentation',
              label: 'Documentation',
              navId: 'documentation-nav-id',
              type: 'attachment',
            },
          ],
        },
      ],
    } as Form;

    expect(
      hydrateLegacyAttachments(form, {
        data: { rows: [{ name: 'First' }, { name: 'Second' }] },
        attachments: [attachment],
      }),
    ).toEqual({
      data: {
        rows: [{ name: 'First', documentation: attachment }, { name: 'Second' }],
      },
      attachments: [],
    });
  });
});
