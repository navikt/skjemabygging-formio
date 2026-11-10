import { describe, expect, it } from 'vitest';
import { attachmentFieldPath } from './attachmentFieldPath';

describe('attachmentFieldPath', () => {
  it('uses the component submission path for its choice', () => {
    expect(attachmentFieldPath('person.documentation', 'documentation', 'value')).toBe('person.documentation.value');
  });

  it('keeps repeated attachment fields stable by attachment ID', () => {
    expect(attachmentFieldPath('rows[0].documentation', 'documentation-rows-0-', 'files')).toBe(
      'rows[0].documentation.documentation-rows-0-.files',
    );
  });

  it('uses the top-level attachment path for personal ID', () => {
    expect(attachmentFieldPath(undefined, 'personal-id', 'value')).toBe('attachments.personal-id.value');
    expect(attachmentFieldPath(undefined, 'personal-id', 'files')).toBe('attachments.personal-id.files');
  });
});
