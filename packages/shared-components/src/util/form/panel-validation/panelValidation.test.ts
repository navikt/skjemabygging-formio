import { Component, NavFormType, PanelValidation } from '@navikt/skjemadigitalisering-shared-domain';
import { findFormStartingPoint } from './panelValidation';

const input = (key) => ({ key, input: true }) as Component;

const firstPanelWithOneInput = { key: 'firstPanelWithOneInput', components: [input('firstInput')] };
const firstPanelWithOneInputValid: PanelValidation = {
  key: firstPanelWithOneInput.key,
  hasValidationErrors: false,
  summaryComponents: ['firstInput'],
  firstInputComponent: input('firstInput'),
};

const panelWithOneInput = { key: 'panelWithOneInput', components: [input('singleInput')] };
const panelWithOneInputValid: PanelValidation = {
  key: panelWithOneInput.key,
  hasValidationErrors: false,
  summaryComponents: ['singleInput'],
  firstInputComponent: input('singleInput'),
};

const panelWithThreeInputs = {
  key: 'panelWithThreeInputs',
  components: [{ key: 'notAnInput' }, input('input1'), input('input2'), input('input3')],
};
const panelWithThreeInputsValid: PanelValidation = {
  key: panelWithThreeInputs.key,
  hasValidationErrors: false,
  summaryComponents: ['input1', 'input2'],
  firstInputComponent: input('input1'),
};

const panelWithNoInputs = {
  key: 'panelWithNoInputs',
  components: [{ key: 'notAnInput' }, { key: 'alsoNotAnInput' }],
};
const panelWithNoInputsValid = {
  key: panelWithNoInputs.key,
  hasValidationErrors: false,
  summaryComponents: [],
};

const nestedInput = input('nestedInput');
const panelWithNestedInput = {
  key: 'panelWithNestedInput',
  components: [
    {
      key: 'level1',
      components: [{ key: 'level2', components: [nestedInput] }],
    },
    input('topLevelInput'),
  ],
};
const panelWithNestedInputValid: PanelValidation = {
  key: panelWithNestedInput.key,
  hasValidationErrors: false,
  summaryComponents: ['nestedInput', 'topLevelInput'],
  firstInputComponent: nestedInput,
};

describe('panelValidationUtils', () => {
  describe('findFormStartingPoint', () => {
    describe('When form has validation errors', () => {
      it('returns key of first input component with an error', () => {
        const form = { components: [firstPanelWithOneInput, panelWithThreeInputs, panelWithOneInput] } as NavFormType;
        const panelValidation: PanelValidation[] = [
          firstPanelWithOneInputValid,
          {
            ...panelWithThreeInputsValid,
            hasValidationErrors: true,
            firstInputWithValidationError: 'input2',
          },
          panelWithOneInputValid,
        ];
        const startingPoint = findFormStartingPoint(form, panelValidation);
        expect(startingPoint).toEqual({ panel: 'panelWithThreeInputs', component: 'input2' });
      });

      it('returns key of the first input component in an empty panel, if it comes before any validation error', () => {
        const form = { components: [firstPanelWithOneInput, panelWithThreeInputs, panelWithOneInput] } as NavFormType;
        const panelValidation: PanelValidation[] = [
          firstPanelWithOneInputValid,
          { ...panelWithThreeInputsValid, summaryComponents: [] },
          { ...panelWithOneInputValid, hasValidationErrors: true, firstInputWithValidationError: 'singleInput' },
        ];
        expect(findFormStartingPoint(form, panelValidation)).toEqual({
          panel: panelWithThreeInputs.key,
          component: 'input1',
        });
      });
    });

    describe('When form has no validation errors', () => {
      const form = { components: [panelWithThreeInputs, panelWithNestedInput, panelWithOneInput] } as NavFormType;

      it('returns key of the first input component in an empty panel', () => {
        const panelValidation: PanelValidation[] = [
          panelWithThreeInputsValid,
          { ...panelWithNestedInputValid, summaryComponents: [] },
          { ...panelWithOneInputValid, summaryComponents: [] },
        ];
        expect(findFormStartingPoint(form, panelValidation)).toEqual({
          panel: panelWithNestedInput.key,
          component: 'nestedInput',
        });
      });

      it('returns key of the first panel, if no panels are empty', () => {
        const panelValidation: PanelValidation[] = [
          panelWithThreeInputsValid,
          panelWithNestedInputValid,
          panelWithOneInputValid,
        ];
        expect(findFormStartingPoint(form, panelValidation)).toEqual({
          panel: panelWithThreeInputs.key,
          component: 'input1',
        });
      });
    });

    describe('When the first panel has no input components', () => {
      const form = { components: [panelWithNoInputs, panelWithOneInput, panelWithThreeInputs] } as NavFormType;

      it('returns key of first panel when there are no empty panels or validation errors', () => {
        const panelValidation: PanelValidation[] = [
          panelWithNoInputsValid,
          panelWithOneInputValid,
          panelWithThreeInputsValid,
        ];
        expect(findFormStartingPoint(form, panelValidation)).toEqual({
          panel: panelWithNoInputs.key,
          component: '',
        });
      });

      it('does not return key of first panel if a panel has validation errors', () => {
        const panelValidation: PanelValidation[] = [
          panelWithNoInputsValid,
          panelWithOneInputValid,
          { ...panelWithThreeInputsValid, hasValidationErrors: true, firstInputWithValidationError: 'input2' },
        ];
        expect(findFormStartingPoint(form, panelValidation)).toEqual({
          panel: panelWithThreeInputsValid.key,
          component: 'input2',
        });
      });

      it('does not return key of first panel if a panel has no submission', () => {
        const panelValidation: PanelValidation[] = [
          panelWithNoInputsValid,
          panelWithOneInputValid,
          { ...panelWithThreeInputsValid, summaryComponents: [] },
        ];
        expect(findFormStartingPoint(form, panelValidation)).toEqual({
          panel: panelWithThreeInputsValid.key,
          component: 'input1',
        });
      });
    });
  });
});
