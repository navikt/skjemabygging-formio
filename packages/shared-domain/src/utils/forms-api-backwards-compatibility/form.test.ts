import { describe, expect, it } from 'vitest';
import { NavFormType } from '../../models';
import { mapFormToNavForm, mapNavFormToForm } from './form';

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

  it('preserves publication metadata through the static and frontend mappings', () => {
    const form = {
      tags: [],
      type: 'form',
      display: 'wizard',
      name: 'Published form',
      title: 'Published form',
      path: 'published-form',
      properties: {
        skjemanummer: 'NAV 12-34.56',
        tema: 'TSO',
        submissionTypes: [],
        subsequentSubmissionTypes: [],
        publishedLanguages: ['nb', 'nn'],
      },
      components: [],
      status: 'published',
    } satisfies NavFormType;

    const frontendForm = mapFormToNavForm(mapNavFormToForm(form));

    expect(frontendForm).toMatchObject({
      status: 'published',
      publishedLanguages: ['nb', 'nn'],
      properties: { publishedLanguages: ['nb', 'nn'] },
    });
  });
});
