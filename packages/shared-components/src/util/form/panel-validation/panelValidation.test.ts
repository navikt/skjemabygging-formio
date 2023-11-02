import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { findFormStartingPoint, PanelValidation } from './panelValidation';

describe('panelValidationUtils', () => {
  describe('findFormStartingPoint', () => {
    const input = (key) => ({ key, input: true });
    const firstPanelWithOneInput = { key: 'firstPanelWithOneInput', components: [input('firstInput')] };
    const firstPanelWithOneInputValid: PanelValidation = {
      key: firstPanelWithOneInput.key,
      hasValidationErrors: false,
      summaryComponents: ['firstInput'],
    };
    const panelWithOneInput = { key: 'panelWithOneInput', components: [input('singleInput')] };
    const panelWithOneInputValid: PanelValidation = {
      key: panelWithOneInput.key,
      hasValidationErrors: false,
      summaryComponents: ['singleInput'],
    };
    const panelWithThreeInputs = {
      key: 'panelWithThreeInputs',
      components: [{ key: 'notAnInput' }, input('input1'), input('input2'), input('input3')],
    };
    const panelWithThreeInputsValid: PanelValidation = {
      key: panelWithThreeInputs.key,
      hasValidationErrors: false,
      summaryComponents: ['input1', 'input2'],
    };
    const panelWithNestedInput = {
      key: 'panelWithNestedInput',
      components: [
        {
          key: 'level1',
          components: [{ key: 'level2', components: [input('nestedInput')] }],
        },
        input('topLevelInput'),
      ],
    };
    const panelWithNestedInputValid: PanelValidation = {
      key: panelWithNestedInput.key,
      hasValidationErrors: false,
      summaryComponents: ['nestedInput', 'topLevelInput'],
    };

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
  });
});
