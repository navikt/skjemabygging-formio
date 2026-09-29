import { describe, expect, it } from 'vitest';
import { NavFormType } from '../../models';
import { mapNavFormToForm } from './form';

describe('mapNavFormToForm', () => {
  it('preserves version metadata from static forms', () => {
    const form = {
      tags: [],
      type: 'form',
      display: 'wizard',
      name: 'Test form',
      title: 'Test form',
      path: 'test-form',
      properties: {
        skjemanummer: 'NAV 12-34.56',
        tema: 'TSO',
        submissionTypes: [],
        subsequentSubmissionTypes: [],
      },
      components: [],
      revision: 7,
      publicationId: 'publication-123',
      status: 'published',
    } satisfies NavFormType;

    expect(mapNavFormToForm(form)).toMatchObject({
      revision: 7,
      publicationId: 'publication-123',
      status: 'published',
    });
  });
});
