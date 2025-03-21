import {
  Form,
  FormsApiFormTranslation,
  FormsApiGlobalTranslation,
  MockedComponentObjectForTest,
} from '@navikt/skjemadigitalisering-shared-domain';
import { generateAndPopulateTranslationsForForm } from './editFormTranslationsUtils';

const { createFormsApiFormObject, createPanelObject, createDummyTextfield, createDummySelectComponent } =
  MockedComponentObjectForTest;

describe('editFormTranslationsUtils', () => {
  describe('generateAndPopulateTranslationsForForm', () => {
    let form: Form;

    beforeEach(() => {
      form = createFormsApiFormObject(
        [
          createPanelObject('Side 1', [
            createDummyTextfield('keyBasedTranslation'),
            createDummyTextfield('Tekst uten oversettelse'),
            createDummyTextfield('Tekst med oversettelse'),
            createDummyTextfield('Tekst med globalt overskrevet oversettelse'),
            createDummyTextfield('Tekst uten oversettelse, med global oversettelse'),
            createDummySelectComponent('Hjemmelaget landvelger', [{ value: 'Norge', label: 'Norge' }]),
          ]),
        ],
        'Form title',
      );
    });

    const storedTranslations: Record<string, FormsApiFormTranslation> = {
      keyBasedTranslation: {
        key: 'keyBasedTranslation',
        nb: 'Nøkkelbasert oversettelse',
        en: 'Key based translation',
      },
      'Tekst med oversettelse': {
        key: 'Tekst med oversettelse',
        nb: 'Tekst med oversettelse',
        en: 'Text with translation',
      },
      'Tekst med globalt overskrevet oversettelse': {
        key: 'Tekst med globalt overskrevet oversettelse',
        nb: 'Tekst med globalt overskrevet oversettelse',
        globalTranslationId: 1,
      },
    };

    const globalTranslations: Record<string, FormsApiGlobalTranslation> = {
      'Tekst med globalt overskrevet oversettelse': {
        id: 1,
        key: 'Tekst med globalt overskrevet oversettelse',
        nb: 'Tekst med globalt overskrevet oversettelse',
        nn: 'Global Tekst NN',
        en: 'Global Text EN',
        tag: 'statiske-tekster',
      },
      'Tekst uten oversettelse, med global oversettelse': {
        id: 2,
        key: 'Tekst uten oversettelse, med global oversettelse',
        nb: 'Tekst uten oversettelse, med global oversettelse',
        nn: 'Tekst uten oversettelse, med global oversettelse NN',
        en: 'Key based global translation EN',
        tag: 'statiske-tekster',
      },
    };

    it('should populate translations from stored translations', () => {
      const result = generateAndPopulateTranslationsForForm(form, storedTranslations, globalTranslations);
      expect(result).toEqual([
        {
          key: 'Form title',
          nb: 'Form title',
        },
        {
          key: 'Side 1',
          nb: 'Side 1',
        },
        {
          key: 'keyBasedTranslation',
          nb: 'Nøkkelbasert oversettelse',
          en: 'Key based translation',
        },
        {
          key: 'Tekst uten oversettelse',
          nb: 'Tekst uten oversettelse',
        },
        {
          key: 'Tekst med oversettelse',
          nb: 'Tekst med oversettelse',
          en: 'Text with translation',
        },
        {
          key: 'Tekst med globalt overskrevet oversettelse',
          globalTranslationId: 1,
          nb: 'Tekst med globalt overskrevet oversettelse',
          nn: 'Global Tekst NN',
          en: 'Global Text EN',
        },
        {
          key: 'Tekst uten oversettelse, med global oversettelse',
          globalTranslationId: 2,
          nb: 'Tekst uten oversettelse, med global oversettelse',
          nn: 'Tekst uten oversettelse, med global oversettelse NN',
          en: 'Key based global translation EN',
        },
        {
          key: 'Hjemmelaget landvelger',
          nb: 'Hjemmelaget landvelger',
        },
      ]);
    });
  });
});
