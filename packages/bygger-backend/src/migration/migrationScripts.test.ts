import { FormPropertiesType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { getEditScript, migrateForm, migrateForms } from './migrationScripts';
import {
  formWithAdvancedConditionalToRadio,
  formWithSimpleConditionalToCheckbox,
  formWithSimpleConditionalToRadio,
  originalFodselsnummerComponent,
  originalForm,
  originalPanelComponent,
  originalSkjemaGruppeComponent,
  originalTextFieldComponent,
} from './testData';
import mockedForm from './testdata/form';

type FormPropertiesTypeExtended = FormPropertiesType & { ettersending?: string };
type NavFormTypeExtended = NavFormType & { properties: FormPropertiesTypeExtended };

const allForms: NavFormType[] = [
  { ...mockedForm, path: 'form1', properties: { ...mockedForm.properties, skjemanummer: 'form1' } },
  { ...mockedForm, path: 'form2', properties: { ...mockedForm.properties, skjemanummer: 'form2' } },
  { ...mockedForm, path: 'form3', properties: { ...mockedForm.properties, skjemanummer: 'form3' } },
];

describe('Migration scripts', () => {
  describe('migrateForm', () => {
    const fnrEditOptions = { 'validate.custom': 'valid = instance.newValidateFnr(input)' };

    it('can update component based on type', () => {
      const { migratedForm: actual } = migrateForm(originalForm, {}, { type: 'fnrfield' }, {}, fnrEditOptions);
      expect(actual).toEqual({
        ...originalForm,
        components: [
          {
            ...originalFodselsnummerComponent,
            validate: {
              custom: 'valid = instance.newValidateFnr(input)',
              required: true,
            },
          },
          originalTextFieldComponent,
        ],
      });
    });

    it('does not update component based on type when form search filters do not match', () => {
      const formSearchFiltersFromParam = { 'properties.tema': 'LOS' };
      const { migratedForm: actual } = migrateForm(
        originalForm,
        formSearchFiltersFromParam,
        { type: 'fnrfield' },
        {},
        fnrEditOptions,
      );
      expect(actual).toEqual(originalForm);
    });

    it('can migrate subcomponents', () => {
      const { migratedForm: actual } = migrateForm(
        {
          path: 'test-form',
          components: [
            {
              ...originalPanelComponent,
              components: [originalFodselsnummerComponent],
            },
          ],
        } as unknown as NavFormType,
        {},
        { type: 'fnrfield' },
        {},
        fnrEditOptions,
      );

      expect(actual).toEqual({
        path: 'test-form',
        components: [
          {
            ...originalPanelComponent,
            components: [
              {
                ...originalFodselsnummerComponent,
                validate: {
                  custom: 'valid = instance.newValidateFnr(input)',
                  required: true,
                },
              },
            ],
          },
        ],
      });
    });

    it('can migrate subcomponents of a migrated component', () => {
      const { migratedForm: actual } = migrateForm(
        {
          path: 'test-form',
          components: [
            {
              ...originalSkjemaGruppeComponent,
              components: [
                {
                  ...originalSkjemaGruppeComponent,
                  key: 'subSkjemaGruppe',
                  components: [originalTextFieldComponent],
                },
              ],
            },
          ],
        } as unknown as NavFormType,
        {},
        { type: 'navSkjemagruppe' },
        {},
        { modifiedByTest: true },
      );

      expect(actual).toEqual({
        path: 'test-form',
        components: [
          {
            ...originalSkjemaGruppeComponent,
            modifiedByTest: true,
            components: [
              {
                ...originalSkjemaGruppeComponent,
                key: 'subSkjemaGruppe',
                modifiedByTest: true,
                components: [originalTextFieldComponent],
              },
            ],
          },
        ],
      });
    });

    describe('can migrate form properties', () => {
      it('sets prop when not exists', () => {
        const formSearchFiltersFromParam = {
          'properties.ettersending__n_exists': true,
        };
        const propsEditOptions = {
          'properties.ettersending': 'PAPIR_OG_DIGITAL',
        };

        const original: NavFormType = {
          ...originalForm,
          properties: {
            ...originalForm.properties,
            submissionTypes: ['DIGITAL'],
            subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
          },
        };
        const { migratedForm: actual } = migrateForm(
          original,
          formSearchFiltersFromParam,
          {},
          {},
          propsEditOptions,
          'form',
        );
        expect(actual).toEqual({
          ...original,
          properties: {
            ...original.properties,
            ettersending: 'PAPIR_OG_DIGITAL',
          },
        });
      });

      it('does not change prop which exists', () => {
        const formSearchFiltersFromParam = {
          'properties.ettersending__n_exists': true,
        };
        const propsEditOptions = {
          'properties.ettersending': 'PAPIR_OG_DIGITAL',
        };

        const original: NavFormTypeExtended = {
          ...originalForm,
          properties: {
            ...originalForm.properties,
            submissionTypes: ['DIGITAL'],
            ettersending: 'KUN_DIGITAL',
          },
        };
        const { migratedForm: actual } = migrateForm(
          original,
          formSearchFiltersFromParam,
          {},
          {},
          propsEditOptions,
          'form',
        );
        expect(actual).toEqual(original);
      });
    });
  });

  describe('migrateForms', () => {
    it('generates log only for included form paths', async () => {
      const { log } = await migrateForms({}, { disabled: false }, {}, { disabled: true }, allForms, ['form1', 'form3']);
      expect(Object.keys(log)).toEqual(['form1', 'form3']);
    });

    it('only migrates forms included by the provided formPaths', async () => {
      const { migratedForms } = await migrateForms({}, { disabled: false }, {}, { disabled: true }, allForms, [
        'form2',
        'form3',
      ]);
      expect(migratedForms).toHaveLength(2);
      expect(migratedForms[0]?.path).toBe('form2');
      expect(migratedForms[1]?.path).toBe('form3');
    });

    describe('When searchFilters are provided', () => {
      let log;
      let migratedForms;

      beforeEach(async () => {
        const migrated = await migrateForms(
          {},
          { key__contains: 'componentWithSimpleConditional' },
          {},
          { disabled: true },
          [
            formWithSimpleConditionalToRadio, // match on searchFilters
            formWithAdvancedConditionalToRadio, // no match
            formWithSimpleConditionalToCheckbox, // match on searchFilters
          ],
        );
        migratedForms = migrated.migratedForms;
        log = migrated.log;
      });

      it('only returns search results for forms with components that matches both', async () => {
        expect(Object.keys(log)).toEqual(['formWithSimpleConditionalToRadio', 'formWithSimpleConditionalToCheckbox']);
      });

      it('only migrates forms with components that matches both', async () => {
        expect(migratedForms).toEqual([
          expect.objectContaining({ path: 'formWithSimpleConditionalToRadio' }),
          expect.objectContaining({ path: 'formWithSimpleConditionalToCheckbox' }),
        ]);
      });
    });

    describe('When dependencyFilters are provided (but searchFilters are not)', () => {
      let log;
      let migratedForms;

      beforeEach(async () => {
        const migrated = await migrateForms({}, {}, { type: 'radio' }, { disabled: true }, [
          formWithSimpleConditionalToRadio, // match on dependencyFilters
          formWithAdvancedConditionalToRadio, // match on dependencyFilters
          formWithSimpleConditionalToCheckbox, // no match
        ]);
        log = migrated.log;
        migratedForms = migrated.migratedForms;
      });

      it('only returns search results for forms that matches filters', async () => {
        expect(Object.keys(log)).toEqual(['formWithSimpleConditionalToRadio', 'formWithAdvancedConditionalToRadio']);
      });

      it('only migrates forms that matches filters', async () => {
        expect(migratedForms).toEqual([
          expect.objectContaining({ path: 'formWithSimpleConditionalToRadio' }),
          expect.objectContaining({ path: 'formWithAdvancedConditionalToRadio' }),
        ]);
      });
    });

    describe('When both searchFilters and dependencyFilters are provided', () => {
      let log;
      let migratedForms;

      beforeEach(async () => {
        const migrated = await migrateForms(
          {},
          { key__contains: 'componentWithSimpleConditional' },
          { type: 'radio' },
          { disabled: true },
          [
            formWithSimpleConditionalToRadio, // match on both search and dependency filters
            formWithAdvancedConditionalToRadio, // match on dependencyFilters
            formWithSimpleConditionalToCheckbox, // match on searchFilters
          ],
        );
        migratedForms = migrated.migratedForms;
        log = migrated.log;
      });

      it('only returns search results for forms with components that matches both', async () => {
        expect(Object.keys(log)).toEqual(['formWithSimpleConditionalToRadio']);
      });

      it('only migrates forms with components that matches both', async () => {
        expect(migratedForms).toEqual([expect.objectContaining({ path: 'formWithSimpleConditionalToRadio' })]);
      });
    });

    describe('When no filters are provided', () => {
      let log;
      let migratedForms;

      beforeEach(async () => {
        const migrated = await migrateForms({}, {}, {}, { disabled: true }, [
          formWithSimpleConditionalToRadio,
          formWithAdvancedConditionalToRadio,
          formWithSimpleConditionalToCheckbox,
        ]);
        migratedForms = migrated.migratedForms;
        log = migrated.log;
      });

      it('returns search results for all forms', () => {
        expect(Object.keys(log)).toEqual([
          'formWithSimpleConditionalToRadio',
          'formWithAdvancedConditionalToRadio',
          'formWithSimpleConditionalToCheckbox',
        ]);
      });

      it('migrates all forms', () => {
        expect(migratedForms).toEqual([
          expect.objectContaining({ path: 'formWithSimpleConditionalToRadio' }),
          expect.objectContaining({ path: 'formWithAdvancedConditionalToRadio' }),
          expect.objectContaining({ path: 'formWithSimpleConditionalToCheckbox' }),
        ]);
      });
    });

    describe('When migration level is form', () => {
      it('only generates log with forms where props were migrated', async () => {
        const formSearchFiltersFromParam = {
          'properties.ettersending__n_exists': true,
        };
        const propsEditOptions = {
          'properties.ettersending': 'PAPIR_OG_DIGITAL',
        };

        const originalForm1: NavFormType = {
          ...originalForm,
          properties: {
            ...originalForm.properties,
            skjemanummer: 'Form1',
            submissionTypes: ['DIGITAL'],
            subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
          },
        };

        const originalForm2: NavFormTypeExtended = {
          ...originalForm,
          properties: {
            ...originalForm.properties,
            skjemanummer: 'Form2',
            submissionTypes: ['DIGITAL'],
            ettersending: 'KUN_DIGITAL',
          },
        };
        const { migratedForms, log } = await migrateForms(
          formSearchFiltersFromParam,
          {},
          {},
          propsEditOptions,
          [originalForm1, originalForm2],
          [],
          'form',
        );
        expect(migratedForms).toHaveLength(1);
        const logElement1 = log[originalForm1.properties.skjemanummer];
        expect(logElement1).toEqual(
          expect.objectContaining({
            found: 1,
            changed: 1,
            skjemanummer: 'Form1',
            diff: [
              {
                properties: {
                  ettersending_NEW: 'PAPIR_OG_DIGITAL',
                  ettersending_ORIGINAL: undefined,
                },
              },
            ],
          }),
        );
      });
    });
  });

  describe('getEditScript', () => {
    let testComponent;

    beforeEach(() => {
      testComponent = {
        prop1: 'prop1',
        prop2: {
          prop2_1: 'prop2_1',
          prop2_2: 'prop2_2',
          prop2_3: 'prop2_3',
        },
        prop3: {
          prop3_1: {
            prop3_1_1: 'prop3_1_1',
            prop3_1_2: 'prop3_1_2',
          },
          prop3_2: {
            prop3_2_1: 'prop3_2_1',
          },
          prop3_3: 'prop3_3',
        },
      };
    });

    it('returns the original component if editOptions is empty', () => {
      expect(getEditScript({})(testComponent)).toEqual(testComponent);
    });

    it('edits a property', () => {
      const editOptions = { prop1: 'newValue' };
      expect(getEditScript(editOptions)(testComponent)).toEqual({ ...testComponent, prop1: 'newValue' });
    });

    it('edits properties in nested property, while preserving existing properties', () => {
      const editOptions = { 'prop2.prop2_1': 'newValue1', 'prop2.prop2_2': 'newValue2' };
      expect(getEditScript(editOptions)(testComponent)).toEqual({
        ...testComponent,
        prop2: { ...testComponent.prop2, prop2_1: 'newValue1', prop2_2: 'newValue2' },
      });
    });

    it('edits properties in several nested properties, while preserving existing properties', () => {
      const editOptions = {
        prop1: 'newValue1',
        'prop2.prop2_2': 'newValue2',
        'prop3.prop3_1.prop3_1_1': 'newValue3',
        'prop3.prop3_3': 'newValue4',
      };
      expect(getEditScript(editOptions)(testComponent)).toEqual({
        ...testComponent,
        prop1: 'newValue1',
        prop2: { ...testComponent.prop2, prop2_2: 'newValue2' },
        prop3: {
          ...testComponent.prop3,
          prop3_1: { ...testComponent.prop3.prop3_1, prop3_1_1: 'newValue3' },
          prop3_3: 'newValue4',
        },
      });
    });
  });
});
