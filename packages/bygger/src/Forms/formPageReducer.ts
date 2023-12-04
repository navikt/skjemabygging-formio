import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
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
        form: formClone,
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
