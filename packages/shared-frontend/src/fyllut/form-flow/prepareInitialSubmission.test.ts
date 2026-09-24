import { Form, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import prepareSubmissionForTransport from '../submission/prepareSubmissionForTransport';
import { prepareInitialSubmission } from './prepareInitialSubmission';

const createForm = (components: Form['components']): Form =>
  ({
    title: 'Test form',
    path: 'test-form',
    components: [{ key: 'panel', type: 'panel', components }],
    properties: { submissionTypes: ['DIGITAL'] },
  }) as Form;

describe('prepareInitialSubmission', () => {
  it.each(['paper', 'digital'] as const)(
    'normalizes old other-document choices before conditions and autosave (%s)',
    (method) => {
      const form = createForm([
        { key: 'documentation', label: 'Documentation', type: 'attachment', attachmentType: 'other', input: true },
        {
          key: 'details',
          label: 'Details',
          type: 'textfield',
          input: true,
          customConditional: 'show = data.documentation && data.documentation.key === "ettersender";',
        },
      ]);
      const prepared = prepareInitialSubmission(
        form,
        {
          data: { documentation: { key: 'ettersender', additionalDocumentation: 'Explanation' }, details: 'Keep me' },
        },
        'nb',
        method,
      );
      expect(prepared?.data).toEqual({
        documentation: [
          {
            attachmentId: 'documentation',
            navId: 'documentation',
            type: 'other',
            value: 'ettersender',
            additionalDocumentation: 'Explanation',
            files: [],
          },
        ],
        details: 'Keep me',
      });
      expect(prepareSubmissionForTransport(prepared!).data).toMatchObject({
        documentation: [{ attachmentId: 'documentation', value: 'ettersender', type: 'other' }],
        details: 'Keep me',
      });
    },
  );

  it('initializes an unvisited sole digital upload choice canonically', () => {
    const form = createForm([
      {
        key: 'documentation',
        label: 'Documentation',
        type: 'attachment',
        input: true,
        attachmentValues: { leggerVedNaa: { enabled: true } },
      },
    ]);
    expect(prepareInitialSubmission(form, { data: {} }, 'nb', 'digital')?.data.documentation).toEqual({
      attachmentId: 'documentation',
      navId: 'documentation',
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    });
    expect(prepareInitialSubmission(form, { data: {} }, 'nb', 'paper')?.data.documentation).toBeUndefined();
  });
  it('normalizes data-grid rows while preserving their indices', () => {
    const form = createForm([
      {
        key: 'rows',
        label: 'Rows',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [{ key: 'name', label: 'Name', type: 'textfield', input: true }],
      },
    ]);

    expect(
      prepareInitialSubmission(form, { data: { rows: [null, { name: 'Kari' }] } } as never, 'nb', 'digital'),
    ).toEqual({ data: { rows: [{}, { name: 'Kari' }] } });
  });

  it('normalizes nested data-grid rows within each parent row', () => {
    const form = createForm([
      {
        key: 'groups',
        label: 'Groups',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [
          {
            key: 'members',
            label: 'Members',
            type: 'datagrid',
            input: true,
            tree: true,
            components: [{ key: 'name', label: 'Name', type: 'textfield', input: true }],
          },
        ],
      },
    ]);

    expect(
      prepareInitialSubmission(
        form,
        { data: { groups: [{ members: [null, { name: 'Kari' }] }] } } as never,
        'nb',
        'digital',
      ),
    ).toEqual({ data: { groups: [{ members: [{}, { name: 'Kari' }] }] } });
  });

  it('hydrates legacy attachments before reconciling conditional fields', () => {
    const attachment: SubmissionAttachment = {
      attachmentId: 'documentation',
      navId: 'documentation-nav-id',
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    };
    const form = createForm([
      {
        key: 'documentation',
        label: 'Documentation',
        type: 'attachment',
        input: true,
        navId: 'documentation-nav-id',
      },
      {
        key: 'details',
        label: 'Details',
        type: 'textfield',
        input: true,
        customConditional: 'show = Boolean(data.documentation);',
      },
    ]);

    expect(
      prepareInitialSubmission(form, { data: { details: 'Keep me' }, attachments: [attachment] }, 'nb', 'digital'),
    ).toEqual({
      data: {
        documentation: attachment,
        details: 'Keep me',
      },
      attachments: [],
    });
  });

  it('preserves uploaded files when a legacy draft is migrated and saved', () => {
    const attachment: SubmissionAttachment = {
      attachmentId: 'documentation',
      navId: 'documentation-nav-id',
      type: 'default',
      value: 'leggerVedNaa',
      files: [
        {
          attachmentId: 'documentation',
          fileId: 'file-123',
          fileName: 'documentation.pdf',
          innsendingId: 'draft-123',
          size: 1234,
        },
      ],
    };
    const form = createForm([
      {
        key: 'documentation',
        label: 'Documentation',
        type: 'attachment',
        input: true,
        navId: 'documentation-nav-id',
      },
    ]);

    const prepared = prepareInitialSubmission(
      form,
      {
        data: {},
        attachments: [attachment],
        fyllutState: { mellomlagring: { isActive: true } },
      },
      'nb',
      'digital',
    );

    expect(prepareSubmissionForTransport(prepared!)).toEqual({
      data: { documentation: attachment },
      attachments: [],
    });
  });

  it('preserves current attachment data when the definition omits input', () => {
    const attachment: SubmissionAttachment = {
      attachmentId: 'documentation',
      navId: 'documentation-nav-id',
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    };
    const form = createForm([
      {
        key: 'documentation',
        label: 'Documentation',
        type: 'attachment',
        navId: 'documentation-nav-id',
      },
    ]);

    expect(prepareInitialSubmission(form, { data: { documentation: attachment } }, 'nb', 'digital')).toEqual({
      data: { documentation: attachment },
    });
  });

  it('removes persisted values without matching form components', () => {
    const form = createForm([
      { key: 'showDetails', label: 'Show details', type: 'navCheckbox', input: true },
      {
        key: 'details',
        label: 'Details',
        type: 'textfield',
        input: true,
        customConditional: 'show = data.showDetails === true;',
      },
    ]);

    expect(
      prepareInitialSubmission(
        form,
        { data: { showDetails: false, details: 'Remove me', legacyValue: 'Keep me' } },
        'nb',
        'digital',
      ),
    ).toEqual({
      data: { showDetails: false },
    });
  });

  it('removes unknown values from containers and data-grid rows', () => {
    const form = createForm([
      {
        key: 'person',
        label: 'Person',
        type: 'container',
        input: true,
        tree: true,
        components: [{ key: 'name', label: 'Name', type: 'textfield', input: true }],
      },
      {
        key: 'rows',
        label: 'Rows',
        type: 'datagrid',
        input: true,
        tree: true,
        components: [{ key: 'value', label: 'Value', type: 'textfield', input: true }],
      },
    ]);

    expect(
      prepareInitialSubmission(
        form,
        {
          data: {
            person: { name: 'Kari', removed: 'Remove me' },
            rows: [
              { value: 'First', removed: 'Remove me' },
              { value: 'Second', removed: 'Remove me' },
            ],
            removedGrid: [{ value: 'Remove me' }],
          },
        },
        'nb',
        'digital',
      ),
    ).toEqual({
      data: {
        person: { name: 'Kari' },
        rows: [{ value: 'First' }, { value: 'Second' }],
      },
    });
  });
});
