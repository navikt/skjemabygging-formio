import { Form, Submission, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { resolveSubmissionAttachments } from './resolveSubmissionAttachments';

const createAttachment = (
  attachmentId: string,
  navId: string,
  value: SubmissionAttachment['value'],
  type: SubmissionAttachment['type'] = 'default',
): SubmissionAttachment => ({
  attachmentId,
  navId,
  type,
  value,
  files: [],
});

const form = {
  components: [
    {
      key: 'panel',
      label: 'Panel',
      type: 'panel',
      components: [
        {
          key: 'container',
          label: 'Container',
          type: 'container',
          input: true,
          tree: true,
          components: [{ key: 'nestedAttachment', label: 'Nested', navId: 'nested-nav-id', type: 'attachment' }],
        },
        {
          key: 'rows',
          label: 'Rows',
          type: 'datagrid',
          input: true,
          tree: true,
          components: [{ key: 'rowAttachment', label: 'Row', navId: 'row-nav-id', type: 'attachment' }],
        },
      ],
    },
  ],
} as Form;

describe('resolveSubmissionAttachments', () => {
  it('does not duplicate a legacy attachment ID already present in canonical data', () => {
    const canonical = createAttachment('same-id', 'nested-nav-id', 'ettersender');
    const legacy = { ...canonical, value: 'leggerVedNaa' as const };
    expect(
      resolveSubmissionAttachments(form, {
        data: { container: { nestedAttachment: canonical } },
        attachments: [legacy],
      }),
    ).toEqual([canonical]);
  });
  it('collects nested attachment values and keeps personal ID', () => {
    const nestedAttachment = createAttachment('nested-1', 'nested-nav-id', 'leggerVedNaa');
    const firstRowAttachment = createAttachment('row-1', 'row-nav-id', 'ettersender');
    const secondRowAttachment = createAttachment('row-2', 'row-nav-id', 'leggerVedNaa');
    const personalId: SubmissionAttachment = {
      attachmentId: 'personal-id',
      navId: 'personal-id',
      type: 'personal-id',
      files: [],
    };

    const submission: Submission = {
      data: {
        container: { nestedAttachment },
        rows: [{ rowAttachment: firstRowAttachment }, { rowAttachment: secondRowAttachment }],
      },
      attachments: [personalId],
    };

    expect(resolveSubmissionAttachments(form, submission)).toEqual([
      personalId,
      nestedAttachment,
      firstRowAttachment,
      secondRowAttachment,
    ]);
  });

  it('does not submit hidden legacy files when the canonical answer says no attachments', () => {
    const dataAttachment = createAttachment('nested-new', 'nested-nav-id', 'nei');
    const replacedLegacyAttachment: SubmissionAttachment = {
      ...createAttachment('nested-old', 'nested-nav-id', 'leggerVedNaa'),
      files: [
        {
          fileId: 'hidden-file',
          attachmentId: 'nested-old',
          innsendingId: 'submission-1',
          fileName: 'legacy.pdf',
          size: 123,
        },
      ],
    };
    const fallbackLegacyAttachment = createAttachment('row-old', 'row-nav-id', 'ettersender');
    const submission: Submission = {
      data: { container: { nestedAttachment: dataAttachment } },
      attachments: [replacedLegacyAttachment, fallbackLegacyAttachment],
    };

    expect(resolveSubmissionAttachments(form, submission)).toEqual([dataAttachment, fallbackLegacyAttachment]);
    expect(submission.attachments).toEqual([replacedLegacyAttachment, fallbackLegacyAttachment]);
  });

  it('preserves a matching legacy attachment instead of a primitive data value', () => {
    const legacyAttachment: SubmissionAttachment = {
      ...createAttachment('nested-nav-id', 'nested-nav-id', 'leggerVedNaa'),
      title: 'Legacy title',
      additionalDocumentation: 'Legacy details',
      files: [
        {
          fileId: 'file-1',
          attachmentId: 'nested-nav-id',
          innsendingId: 'submission-1',
          fileName: 'attachment.pdf',
          size: 123,
        },
      ],
    };

    expect(
      resolveSubmissionAttachments(form, {
        data: { container: { nestedAttachment: 'ettersender' } },
        attachments: [legacyAttachment],
      }),
    ).toEqual([legacyAttachment]);
  });

  it('preserves all matching legacy other attachments', () => {
    const firstAttachment = createAttachment('nested-nav-id', 'nested-nav-id', 'leggerVedNaa', 'other');
    const secondAttachment = createAttachment('nested-nav-id-1', 'nested-nav-id', 'leggerVedNaa', 'other');

    expect(
      resolveSubmissionAttachments(form, {
        data: { container: { nestedAttachment: 'leggerVedNaa' } },
        attachments: [firstAttachment, secondAttachment],
      }),
    ).toEqual([firstAttachment, secondAttachment]);
  });

  it('synthesizes an attachment when primitive data has no legacy match', () => {
    expect(
      resolveSubmissionAttachments(form, {
        data: { container: { nestedAttachment: 'ettersender' } },
      }),
    ).toEqual([createAttachment('nested-nav-id', 'nested-nav-id', 'ettersender')]);
  });

  it('does not submit legacy datagrid attachments hidden by canonical row answers', () => {
    const firstRowAttachment = createAttachment('row-1', 'row-nav-id', 'ettersender');
    const secondRowAttachment = createAttachment('row-2', 'row-nav-id', 'leggerVedNaa');
    const legacyAttachment = createAttachment('row-old', 'row-nav-id', 'levertTidligere');

    expect(
      resolveSubmissionAttachments(form, {
        data: { rows: [{ rowAttachment: firstRowAttachment }, { rowAttachment: secondRowAttachment }] },
        attachments: [legacyAttachment],
      }),
    ).toEqual([firstRowAttachment, secondRowAttachment]);
  });
});
