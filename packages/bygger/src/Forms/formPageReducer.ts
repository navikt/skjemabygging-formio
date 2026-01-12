import { Form, formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';

type FormReducerAction =
  | 'form-loaded'
  | 'form-not-found'
  | 'form-changed'
  | 'form-saved'
  | 'form-error'
  | 'form-discard-unsaved-changes'
  | 'form-deleted';
type Status = 'INITIAL LOADING' | 'FINISHED LOADING' | 'FORM NOT FOUND' | 'FORM DELETED' | 'ERROR';
export type FormReducerActionType = { type: FormReducerAction; form?: Form; publishedForm?: Form };

export interface FormReducerState {
  status: Status;
  dbForm?: Form;
  form?: Form;
  formioForm?: NavFormType;
  publishedForm?: Form | null;
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
        formioForm: formioFormsApiUtils.mapFormToNavForm(formClone), // TODO: temp
        publishedForm: action.publishedForm || state.publishedForm,
      };
    case 'form-changed':
      return {
        ...state,
        dbForm: state.dbForm,
        form: formClone,
        formioForm: formioFormsApiUtils.mapFormToNavForm(formClone), // TODO: temp
      };
    case 'form-discard-unsaved-changes':
      return {
        ...state,
        form: state.dbForm,
        formioForm: state.dbForm ? formioFormsApiUtils.mapFormToNavForm(state.dbForm) : state.formioForm, // TODO: temp
      };
    case 'form-not-found':
      return {
        status: 'FORM NOT FOUND',
      };
    case 'form-error':
      return {
        status: 'ERROR',
      };
    case 'form-deleted':
      return {
        status: 'FORM DELETED',
      };
    default: {
      return state;
    }
  }
};

export default formPageReducer;
