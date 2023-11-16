import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import formPageReducer, { ReducerActionType, ReducerState } from './formPageReducer';

describe('formPageReducer', () => {
  describe('prefill', () => {
    const ORIGINAL_FORM = {
      components: [
        {
          type: 'panel',
          key: 'panel1',
          components: [
            {
              key: 'sokerFornavn1',
              type: 'textfield',
            },
            {
              key: 'sokerEtternavn1',
              type: 'textfield',
            },
          ],
        },
        {
          type: 'panel',
          key: 'panel2',
          components: [
            {
              key: 'sokerFornavn2',
              type: 'textfield',
            },
          ],
        },
      ],
      properties: {
        skjemanummer: 'TEST 123',
      },
    } as NavFormType;

    it('hoists prefill values to form properties', () => {
      const originalState: ReducerState = {
        form: ORIGINAL_FORM,
        status: 'FINISHED LOADING',
      };

      const changedForm: NavFormType = cloneDeep(ORIGINAL_FORM);
      changedForm.components![1].components![0].prefill = 'sokerFornavn';

      const action: ReducerActionType = {
        type: 'form-changed',
        form: changedForm,
      };
      const state = formPageReducer(originalState, action);

      expect(state.form.properties.prefill).toEqual(['sokerFornavn']);
    });

    it('removes duplicate from form properties prefill', () => {
      const originalForm: NavFormType = cloneDeep(ORIGINAL_FORM);
      originalForm.components![0].components![0].prefill = 'sokerFornavn';
      originalForm.components![0].components![1].prefill = 'sokerEtternavn';
      originalForm.properties.prefill = ['sokerFornavn', 'sokerEtternavn'];
      const originalState: ReducerState = {
        form: ORIGINAL_FORM,
        status: 'FINISHED LOADING',
      };

      const changedForm: NavFormType = cloneDeep(originalForm);
      changedForm.components![1].components![0].prefill = 'sokerFornavn';
      const action: ReducerActionType = {
        type: 'form-changed',
        form: changedForm,
      };
      const state = formPageReducer(originalState, action);

      expect(state.form.properties.prefill).toEqual(['sokerFornavn', 'sokerEtternavn']);
    });
  });
});
