import { describe, expect, it } from 'vitest';
import { AttachmentDefinition } from '../../component-types';
import { resolveDefaultSubmissionValue } from '../../defaultSubmissionValue';
import { getAttachmentOptions } from './attachmentOptions';
import { normalizeAttachmentValue } from './attachmentValue';

const component: AttachmentDefinition = {
  key: 'documentation',
  type: 'attachment',
  label: 'Documentation',
  navId: 'doc',
};

describe('attachment boundary', () => {
  const legacyValue = 'neiJegHarIngenEkstraDokumentasjonJegVilLeggeVed';
  const legacyComponent: AttachmentDefinition = {
    ...component,
    otherDocumentation: true,
    values: [
      { value: 'leggerVedNaa', label: 'Upload' },
      { value: legacyValue, label: 'No extra documentation' },
    ],
  };
  it.each([legacyValue, { key: legacyValue, additionalDocumentation: 'Keep this explanation' }])(
    'preserves arbitrary legacy choices and authored defaults %#',
    (value) => {
      const normalized = normalizeAttachmentValue(legacyComponent, 'documentation', value);
      expect(normalized).toMatchObject([
        {
          attachmentId: 'doc',
          navId: 'doc',
          type: 'other',
          value: legacyValue,
          files: [],
          ...(typeof value === 'object' ? { additionalDocumentation: 'Keep this explanation' } : {}),
        },
      ]);
      expect(resolveDefaultSubmissionValue({ ...legacyComponent, defaultValue: value })).toEqual(normalized);
      expect(resolveDefaultSubmissionValue(legacyComponent, 'documentation', 'digital')).toBeUndefined();
    },
  );
  it.each(['leggerVedNaa', { key: 'leggerVedNaa' }])('normalizes a legacy paper choice %j', (value) => {
    expect(normalizeAttachmentValue(component, 'documentation', value)).toEqual({
      attachmentId: 'doc',
      navId: 'doc',
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    });
  });

  it('writes other documentation as an array in paper and digital modes', () => {
    expect(
      normalizeAttachmentValue({ ...component, attachmentType: 'other' }, 'documentation', {
        key: 'ettersender',
        additionalDocumentation: 'Explanation',
      }),
    ).toEqual([
      {
        attachmentId: 'doc',
        navId: 'doc',
        type: 'other',
        value: 'ettersender',
        additionalDocumentation: 'Explanation',
        files: [],
      },
    ]);
  });

  it('normalizes repeated row IDs without overwriting existing server IDs or files', () => {
    const value = normalizeAttachmentValue(component, 'rows[2].documentation', 'leggerVedNaa');
    expect(value).toMatchObject({ attachmentId: 'doc-rows-2-documentation' });
    const stored = {
      attachmentId: 'legacy-id',
      navId: 'doc',
      type: 'default',
      value: 'leggerVedNaa',
      files: [{ fileId: 'keep' }],
    };
    expect(normalizeAttachmentValue(component, 'rows[2].documentation', stored)).toBe(stored);
  });

  it('maps configuration to generic options with deadline and explanation content', () => {
    expect(
      getAttachmentOptions(
        {
          ...component,
          attachmentValues: {
            ettersender: {
              enabled: true,
              showDeadline: true,
              additionalDocumentation: {
                enabled: true,
                label: 'Why?',
                description: 'Explain',
              },
            },
          },
        },
        'digital',
      ),
    ).toMatchObject([
      {
        value: 'ettersender',
        upload: false,
        showDeadline: true,
        additionalDocumentation: { label: 'Why?', description: 'Explain' },
      },
    ]);
  });
});
