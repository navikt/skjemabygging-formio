import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';

type FormReducerAction = 'form-loaded' | 'form-not-found' | 'form-changed' | 'form-saved' | 'form-error';
type Status = 'LOADING' | 'FINISHED LOADING' | 'FORM NOT FOUND' | 'ERROR';
export type FormReducerActionType = { type: FormReducerAction; form?: NavFormType; publishedForm?: NavFormType };

export interface FormReducerState {
  status: Status;
  dbForm?: NavFormType;
  form?: NavFormType;
  publishedForm?: NavFormType | null;
}

const formPageReducer = (state: FormReducerState, action: FormReducerActionType): FormReducerState => {
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
    case 'form-error':
      return {
        status: 'ERROR',
      };
    default: {
      return state;
    }
  }
};

export default formPageReducer;
