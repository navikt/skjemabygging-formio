import { Form, Submission, SubmissionAttachment, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { AttachmentDefinition } from '../../form-components/component-types';
import { collectPageValidationFields } from '../../form-components/page-validation/collectPageValidationFields';
import { validateValue } from '../../validation/validators';
import { toAttachmentFilesValidationFields, toAttachmentValueValidationFields } from './attachmentValidation';

const component: AttachmentDefinition = {
  key: 'documentation',
  type: 'attachment',
  label: 'Documentation',
  navId: 'doc',
  validate: { required: true },
  attachmentValues: { leggerVedNaa: { enabled: true }, ettersender: { enabled: true } },
};
const attachment: SubmissionAttachment = {
  attachmentId: 'doc',
  navId: 'doc',
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
};
const collect = (value: unknown, submissionMethod: SubmissionMethod = 'digital', definition = component) =>
  collectPageValidationFields({
    components: [definition],
    form: { components: [definition] } as Form,
    submission: { data: { documentation: value } as Submission['data'] },
    submissionMethod,
    currentLanguage: 'nb',
  });

describe('attachment validation', () => {
  it.each(['digital', 'digitalnologin'] as const)(
    'validates custom upload choices identically in rendered and unvisited %s fields',
    (method) => {
      const definition: AttachmentDefinition = {
        ...component,
        attachmentType: 'other',
        attachmentValues: undefined,
        values: [
          { value: 'customUpload', label: 'Upload a document', upload: true },
          { value: 'customDecline', label: 'No document', upload: false },
        ],
      };
      const answer: SubmissionAttachment = { ...attachment, type: 'other', value: 'customUpload' };
      const fields = collect([answer], method, definition);
      const input = {
        submissionPath: 'documentation',
        attachmentId: 'doc',
        label: 'Documentation',
        required: true,
        attachment: answer,
        uploadSelected: true,
      };
      expect(fields).toEqual([
        ...toAttachmentValueValidationFields(input),
        ...toAttachmentFilesValidationFields(input),
      ]);
      expect(fields.map((field) => field.statePath)).toEqual([
        'documentation.value',
        'documentation.doc.files',
        'documentation.doc.title',
      ]);
      expect(fields.filter((field) => validateValue(field.value, field.field, field.rules, 'nb'))).toHaveLength(2);
      expect(collect([{ ...answer, value: 'customDecline' }], method, definition)).toHaveLength(1);
      expect(collect([answer], 'paper', definition)).toHaveLength(1);
    },
  );

  it('requires files for an unvisited sole custom upload option', () => {
    const fields = collect(undefined, 'digital', {
      ...component,
      attachmentValues: undefined,
      values: [{ value: 'customUpload', label: 'Upload a document', upload: true }],
    });
    expect(fields.map((field) => field.statePath)).toEqual(['documentation.value', 'documentation.doc.files']);
    expect(fields[0].value).toBe('customUpload');
    expect(validateValue(fields[1].value, fields[1].field, fields[1].rules, 'nb')).toBeDefined();
  });

  it('honors an explicitly disabled upload flag instead of inferring file rules from a modern key', () => {
    expect(
      collect(attachment, 'digital', {
        ...component,
        attachmentValues: undefined,
        values: [{ value: 'leggerVedNaa', label: 'No upload here', upload: false }],
      }),
    ).toHaveLength(1);
  });
  it('uses the same builders for rendered and unvisited digital attachments', () => {
    const input = {
      submissionPath: 'documentation',
      attachmentId: 'doc',
      label: 'Documentation',
      required: true,
      attachment,
    };
    expect(collect(attachment)).toEqual([
      ...toAttachmentValueValidationFields(input),
      ...toAttachmentFilesValidationFields(input),
    ]);
    expect(
      collect(attachment).filter((field) => validateValue(field.value, field.field, field.rules, 'nb')),
    ).toHaveLength(1);
  });

  it('only validates the choice on paper, including canonical other arrays', () => {
    const fields = collect([{ ...attachment, type: 'other' }], 'paper', { ...component, attachmentType: 'other' });
    expect(fields.map((field) => field.statePath)).toEqual(['documentation.value']);
    expect(fields[0].value).toBe('leggerVedNaa');
    expect(validateValue(fields[0].value, fields[0].field, fields[0].rules, 'nb')).toBeUndefined();
  });

  it('requires an uploaded file even for an unvisited implicit single upload choice', () => {
    const fields = collect(undefined, 'digital', {
      ...component,
      attachmentValues: { leggerVedNaa: { enabled: true } },
    });
    expect(fields.map((field) => field.statePath)).toEqual(['documentation.value', 'documentation.doc.files']);
    expect(fields[0].value).toBe('leggerVedNaa');
    expect(validateValue(fields[1].value, fields[1].field, fields[1].rules, 'nb')).toBeDefined();
  });

  it('does not implicitly select the sole paper option', () => {
    const fields = collect(undefined, 'paper', { ...component, attachmentValues: { leggerVedNaa: { enabled: true } } });
    expect(fields).toHaveLength(1);
    expect(fields[0].value).toBeUndefined();
  });

  it('validates a newly added document at stable file and title paths', () => {
    const first = { ...attachment, type: 'other' as const, title: 'First', files: [{ fileId: 'file' }] };
    const second = { ...attachment, type: 'other' as const, attachmentId: 'doc-4', title: '' };
    const fields = collect([first, second], 'digital', { ...component, attachmentType: 'other' });
    expect(fields.map((field) => field.statePath)).toEqual([
      'documentation.value',
      'documentation.doc.files',
      'documentation.doc-4.files',
      'documentation.doc-4.title',
    ]);
    expect(
      collect([first], 'digital', { ...component, attachmentType: 'other' }).some((field) =>
        field.statePath.includes('doc-4'),
      ),
    ).toBe(false);
  });

  it('drops hidden attachments and file rules for non-upload choices', () => {
    expect(collect(attachment, 'digital', { ...component, hidden: true })).toEqual([]);
    expect(collect({ ...attachment, value: 'ettersender' }).map((field) => field.statePath)).toEqual([
      'documentation.value',
    ]);
  });

  it('normalizes legacy string and key answers at the validation boundary', () => {
    expect(collect('leggerVedNaa')).toEqual(collect({ key: 'leggerVedNaa' }));
    expect(collect('leggerVedNaa')).toEqual(collect(attachment));
  });

  it('requires files for personal ID through the ordinary shared builder', () => {
    const fields = toAttachmentFilesValidationFields({
      attachmentId: 'personal-id',
      label: 'ID',
      attachment: { ...attachment, type: 'personal-id', value: 'norwegianPassport' },
    });
    expect(fields[0].statePath).toBe('attachments.personal-id.files');
    expect(validateValue(fields[0].value, fields[0].field, fields[0].rules, 'nb')).toBeDefined();
  });
});
