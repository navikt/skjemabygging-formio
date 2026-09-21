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

  it('uses legacy attachments only when data has no value for the component', () => {
    const dataAttachment = createAttachment('nested-new', 'nested-nav-id', 'leggerVedNaa');
    const replacedLegacyAttachment = createAttachment('nested-old', 'nested-nav-id', 'ettersender');
    const fallbackLegacyAttachment = createAttachment('row-old', 'row-nav-id', 'ettersender');

    expect(
      resolveSubmissionAttachments(form, {
        data: { container: { nestedAttachment: dataAttachment } },
        attachments: [replacedLegacyAttachment, fallbackLegacyAttachment],
      }),
    ).toEqual([dataAttachment, fallbackLegacyAttachment]);
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

  it('uses structured datagrid attachments instead of legacy attachments with the same navId', () => {
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
