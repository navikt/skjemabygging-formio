import { NavFormType, navFormUtils, PrefillType } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';

type ReducerAction = 'form-loaded' | 'form-not-found' | 'form-changed' | 'form-saved';
type Status = 'LOADING' | 'FINISHED LOADING' | 'FORM NOT FOUND';
export type ReducerActionType = { type: ReducerAction; form?: NavFormType; publishedForm?: NavFormType };

export interface ReducerState {
  status: Status;
  dbForm?: NavFormType;
  form?: NavFormType;
  publishedForm?: NavFormType | null;
}

const unique = <T extends Array<any>>(arr: T) => [...new Set(arr)];

const hoistPrefill = (form: NavFormType): NavFormType => {
  form.properties.prefill = unique(
    navFormUtils
      .flattenComponents(form.components)
      .map((comp) => comp.prefill)
      .filter((value) => !!value) as PrefillType[],
  );
  return form;
};

const formPageReducer = (state: ReducerState, action: ReducerActionType) => {
  const formClone = cloneDeep(action.form);
  switch (action.type) {
    case 'form-loaded':
    case 'form-saved':
      return {
        status: 'FINISHED LOADING',
        dbForm: formClone,
        form: formClone,
        publishedForm: action.publishedForm || state.publishedForm,
      };
    case 'form-changed':
      return {
        ...state,
        dbForm: state.dbForm,
        form: hoistPrefill(formClone),
      };
    case 'form-not-found':
      return {
        status: 'FORM NOT FOUND',
      };
    default: {
      return state;
    }
  }
};

export default formPageReducer;
