import { FormBuilderOptions } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormsApiTranslation, mockedComponentObjectForTest } from '@navikt/skjemadigitalisering-shared-domain';
import { generateAndPopulateTags } from '../../context/translations/utils/globalTranslationsUtils';
import { generateAndPopulateTranslationsForForm, generateUnsavedGlobalTranslations } from './editFormTranslationsUtils';

const { createFormsApiFormObject, createPanelObject, createDummyTextfield, createDummySelectComponent } =
  mockedComponentObjectForTest;

describe('editFormTranslationsUtils', () => {
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

  const storedTranslations: Record<string, FormsApiTranslation> = {
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

  const globalTranslations: Record<string, FormsApiTranslation> = {
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

  describe('generateAndPopulateTranslationsForForm', () => {
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

  describe('generateUnsavedGlobalTranslations', () => {
    it('links organization sender defaults from the global static translation catalogue', () => {
      const senderTranslations: FormsApiTranslation[] = [
        {
          id: 101,
          key: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
          nb: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
          nn: 'Organisasjonsnummeret til den verksemda / undereininga du representerer',
          en: 'The organisation number of the company / sub-entity you represent',
          tag: 'statiske-tekster',
        },
        {
          id: 102,
          key: 'Virksomhetens navn',
          nb: 'Virksomhetens navn',
          nn: 'Namnet på verksemda',
          en: 'Company name',
          tag: 'statiske-tekster',
        },
      ];
      const storedGlobals = Object.fromEntries(senderTranslations.map((translation) => [translation.key, translation]));
      const staticTranslations = generateAndPopulateTags(storedGlobals)['statiske-tekster'];
      const staticTranslationsMap = Object.fromEntries(
        staticTranslations.map((translation) => [translation.key, translation]),
      );
      const organizationForm = createFormsApiFormObject(
        [
          {
            ...FormBuilderOptions.builder.organizationGroup.components.senderOrganization.schema,
            key: 'senderOrganization',
          },
        ],
        'Organization form',
      );

      expect(generateUnsavedGlobalTranslations(organizationForm, {}, staticTranslationsMap)).toEqual(
        senderTranslations.map(({ id, key, nb, nn, en }) => ({
          key,
          nb,
          nn,
          en,
          globalTranslationId: id,
        })),
      );
    });

    it('should return global translations for texts without stored translations', () => {
      expect(generateUnsavedGlobalTranslations(form, storedTranslations, globalTranslations)).toEqual([
        {
          en: 'Key based global translation EN',
          globalTranslationId: 2,
          key: 'Tekst uten oversettelse, med global oversettelse',
          nb: 'Tekst uten oversettelse, med global oversettelse',
          nn: 'Tekst uten oversettelse, med global oversettelse NN',
        },
      ]);
    });

    it('should return a matching global translation for an existing blank form translation', () => {
      const blankStoredTranslation: FormsApiTranslation = {
        id: 3,
        key: 'Fødselsattest',
        revision: 4,
        nb: 'Fødselsattest',
        nn: '',
        en: '',
      };
      const matchingGlobalTranslation: FormsApiTranslation = {
        id: 531,
        key: 'Fødselsattest',
        nb: 'Fødselsattest',
        nn: 'Fødselsattest',
        en: 'Birth certificate',
        tag: 'skjematekster',
      };
      const formWithBlankStoredTranslation = createFormsApiFormObject(
        [createDummyTextfield('Fødselsattest')],
        'Form title',
      );

      expect(
        generateUnsavedGlobalTranslations(
          formWithBlankStoredTranslation,
          { Fødselsattest: blankStoredTranslation },
          { Fødselsattest: matchingGlobalTranslation },
        ),
      ).toEqual([
        {
          ...blankStoredTranslation,
          globalTranslationId: 531,
          nn: 'Fødselsattest',
          en: 'Birth certificate',
        },
      ]);
    });
  });
});
