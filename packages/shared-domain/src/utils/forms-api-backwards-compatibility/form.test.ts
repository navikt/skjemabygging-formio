import { Form, NavFormType } from '../../models';
import { mapFormToNavForm, mapNavFormToForm } from './form';

describe('forms-api backwards compatibility mapper', () => {
  it('maps publishedLanguages from properties when top-level field is missing', () => {
    const navForm = {
      tags: [],
      type: 'form',
      display: 'wizard',
      name: 'Test form',
      title: 'Test form',
      path: 'nav100780',
      modified: '2024-09-19T12:21:31.135Z',
      properties: {
        skjemanummer: 'NAV 10-07.80',
        publishedLanguages: ['nn-NO'],
      },
      components: [],
    } as unknown as NavFormType;

    expect(mapNavFormToForm(navForm)).toEqual(
      expect.objectContaining({
        skjemanummer: 'NAV 10-07.80',
        publishedLanguages: ['nn-NO'],
        changedAt: '2024-09-19T12:21:31.135Z',
      }),
    );
  });

  it('keeps publishedLanguages on both top-level and properties when mapping Form to NavFormType', () => {
    const form = {
      skjemanummer: 'NAV 00-10.04',
      path: 'nav001004',
      title: 'Registrering av aktivitet ved import av dagpenger',
      components: [],
      properties: {
        skjemanummer: 'NAV 00-10.04',
      },
      publishedLanguages: ['en', 'nb'],
    } as unknown as Form;

    expect(mapFormToNavForm(form)).toEqual(
      expect.objectContaining({
        publishedLanguages: ['en', 'nb'],
        properties: expect.objectContaining({
          skjemanummer: 'NAV 00-10.04',
          publishedLanguages: ['en', 'nb'],
        }),
      }),
    );
  });
});
