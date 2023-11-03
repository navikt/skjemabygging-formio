import { componentHasDependencyMatchingFilters, getPropertyFromTarget, targetMatchesFilters } from './filterUtils';
import {
  componentWithAdvancedConditionalToRadio,
  componentWithSimpleConditionalToRadio,
  formWithSimpleConditionalToRadio,
  originalTextFieldComponent,
} from './testData';

describe('filterUtils', () => {
  describe('getPropertyFromComponent', () => {
    it('gets the value of a property in the object as a string', () => {
      const actual = getPropertyFromTarget({ value: 'the value' }, ['value']);
      expect(actual).toBe('the value');
    });

    it('gets properties from nested objects', () => {
      const actual = getPropertyFromTarget({ firstLevel: { secondLevel: { thirdLevel: { value: 'the value' } } } }, [
        'firstLevel',
        'secondLevel',
        'thirdLevel',
        'value',
      ]);
      expect(actual).toBe('the value');
    });
  });

  describe('componentMatchesSearchFilters', () => {
    it('returns true if all searchFilters matches the related properties in the component', () => {
      expect(
        targetMatchesFilters(originalTextFieldComponent, [
          {
            key: 'fieldSize',
            value: 'input--xxl',
          },
          { key: 'validateOn', value: 'blur' },
        ]),
      ).toBe(true);
    });

    it('returns false if one searchFilter does not match the related property in the component', () => {
      expect(
        targetMatchesFilters(originalTextFieldComponent, [
          {
            key: 'fieldSize',
            value: 'input--s',
          },
          { key: 'validateOn', value: 'blur' },
        ]),
      ).toBe(false);
    });

    it('matches on nested properties', () => {
      expect(
        targetMatchesFilters(originalTextFieldComponent, [
          {
            key: 'validate.required',
            value: true,
          },
          { key: 'validateOn', value: 'blur' },
        ]),
      ).toBe(true);
      expect(
        targetMatchesFilters(originalTextFieldComponent, [
          {
            key: 'validate.required',
            value: false,
          },
          { key: 'validateOn', value: 'blur' },
        ]),
      ).toBe(false);
    });

    describe('With operators', () => {
      const typeEqTextfield = { key: 'type', value: 'textfield' };
      const typeEqRadio = { key: 'type', value: 'radio' };
      const nonExistingProp = { key: 'nonExistingProp', value: '' };

      describe('equals and not equal', () => {
        it("the operator 'eq' (equals) is the same as default", () => {
          expect(targetMatchesFilters(originalTextFieldComponent, [typeEqTextfield])).toBe(true);
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                ...typeEqTextfield,
                operator: 'eq',
              },
            ]),
          ).toBe(true);

          expect(targetMatchesFilters(originalTextFieldComponent, [typeEqRadio])).toBe(false);
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                ...typeEqRadio,
                operator: 'eq',
              },
            ]),
          ).toBe(false);

          expect(targetMatchesFilters(originalTextFieldComponent, [nonExistingProp])).toBe(false);
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                ...nonExistingProp,
                operator: 'eq',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_eq' (not equals) evaluates to false when the value is equal", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                ...typeEqTextfield,
                operator: 'n_eq',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_eq' (not equals) evaluates to true when the value is not equal", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                ...typeEqRadio,
                operator: 'n_eq',
              },
            ]),
          ).toBe(true);
        });

        it("the operator 'n_eq' (not equals) evaluates to true when prop does not exist", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                ...nonExistingProp,
                operator: 'n_eq',
              },
            ]),
          ).toBe(true);
        });
      });

      describe('exists and not exist', () => {
        it("the operator 'exists' evaluates to false when the property exists", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                key: 'type',
                value: '',
                operator: 'exists',
              },
            ]),
          ).toBe(true);
        });

        it("the operator 'exists' evaluates to false when the property does not exist", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                key: 'non-existing-prop',
                value: '',
                operator: 'exists',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_exists' (does not exist) evaluates to false when the property exists", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                key: 'type',
                value: '',
                operator: 'n_exists',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_exists' (does not exist) evaluates to true when the property does not exist", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                key: 'non-existing-prop',
                value: '',
                operator: 'n_exists',
              },
            ]),
          ).toBe(true);
        });
      });

      describe('contains and not contain', () => {
        const customComponent = {
          ...originalTextFieldComponent,
          customLongText: 'LoremIpsum1234456789!substring-in-custom-long-textqwertyuiop',
          customArray: ['a', 'b', 'member-of-array', 'c'],
        };

        it("the operator 'contains' evaluates to true when the value is a substring", () => {
          expect(
            targetMatchesFilters(customComponent, [
              {
                key: 'customLongText',
                value: 'substring-in-custom-long-text',
                operator: 'contains',
              },
            ]),
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to false when the value is not a substring", () => {
          expect(
            targetMatchesFilters(customComponent, [
              {
                key: 'customLongText',
                value: 'substring-NOT-in-custom-long-text',
                operator: 'contains',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to false when the value is a substring", () => {
          expect(
            targetMatchesFilters(customComponent, [
              {
                key: 'customLongText',
                value: 'substring-in-custom-long-text',
                operator: 'n_contains',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to false when the value is not a substring", () => {
          expect(
            targetMatchesFilters(customComponent, [
              {
                key: 'customLongText',
                value: 'substring-NOT-in-custom-long-text',
                operator: 'n_contains',
              },
            ]),
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to true when the value is a member of an array", () => {
          expect(
            targetMatchesFilters(customComponent, [
              {
                key: 'customArray',
                value: 'member-of-array',
                operator: 'contains',
              },
            ]),
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to false when the value is not a member of an array", () => {
          expect(
            targetMatchesFilters(customComponent, [
              {
                key: 'customArray',
                value: 'not-a-member-of-array',
                operator: 'contains',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to true when the value is not a substring", () => {
          expect(
            targetMatchesFilters(customComponent, [
              {
                key: 'customLongText',
                value: 'substring-NOT-in-custom-long-text',
                operator: 'n_contains',
              },
            ]),
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to false when the property does not exist", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                key: 'customLongText',
                value: 'substring-NOT-in-custom-long-text',
                operator: 'contains',
              },
            ]),
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to true when the property does not exist", () => {
          expect(
            targetMatchesFilters(originalTextFieldComponent, [
              {
                key: 'customLongText',
                value: 'substring-NOT-in-custom-long-text',
                operator: 'n_contains',
              },
            ]),
          ).toBe(true);
        });
      });
    });
  });

  describe('componentHasDependencyMatchingFilters', () => {
    it('returns true when component has a simple conditional dependency to a component that matches the filter', () => {
      expect(
        componentHasDependencyMatchingFilters(formWithSimpleConditionalToRadio, componentWithSimpleConditionalToRadio, [
          { key: 'type', value: 'radio' },
        ]),
      ).toBe(true);
    });

    it('returns false when component has a simple conditional dependency to a component that does not match the filter', () => {
      expect(
        componentHasDependencyMatchingFilters(formWithSimpleConditionalToRadio, componentWithSimpleConditionalToRadio, [
          { key: 'type', value: 'radio' },
          { key: 'disabled', value: 'true' },
        ]),
      ).toBe(false);
    });

    it('returns true when component has an advanced conditional dependency to a component that matches the filter', () => {
      expect(
        componentHasDependencyMatchingFilters(
          formWithSimpleConditionalToRadio,
          componentWithAdvancedConditionalToRadio,
          [{ key: 'type', value: 'radio' }],
        ),
      ).toBe(true);
    });

    it('returns false when component has an advanced conditional dependency to a component that does not match the filter', () => {
      expect(
        componentHasDependencyMatchingFilters(
          formWithSimpleConditionalToRadio,
          componentWithAdvancedConditionalToRadio,
          [
            { key: 'type', value: 'radio' },
            { key: 'disabled', value: 'true' },
          ],
        ),
      ).toBe(false);
    });
  });
});
