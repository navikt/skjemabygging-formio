import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import cloneDeep from "lodash.clonedeep";

type ReducerAction =
  | "form-loaded"
  | "form-not-found"
  | "form-changed"
  | "form-saved"
  | "diff-loaded"
  | "diff-not-found";
type Status = "LOADING" | "FINISHED LOADING" | "FORM NOT FOUND";
type ReducerActionType = { type: ReducerAction; form?: NavFormType; diff?: any };

interface ReducerState {
  status: Status;
  dbForm?: NavFormType;
  form?: NavFormType;
  formDiff?: any;
  hasUnsavedChanges: boolean;
}

const isDifferent = (form, changedForm) => {
  return JSON.stringify(removeIds(cloneDeep(form))) !== JSON.stringify(removeIds(cloneDeep(changedForm)));
};

const removeIds = (object) => {
  const clonedObject = {
    ...object,
  };

  if (clonedObject.id) {
    delete clonedObject.id;
  }

  if (clonedObject.components && clonedObject.components.length > 0) {
    clonedObject.components = clonedObject.components.map((component) => removeIds(component));
  }

  return clonedObject;
};

const formPageReducer = (state: ReducerState, action: ReducerActionType) => {
  const formClone = cloneDeep(action.form);
  switch (action.type) {
    case "form-loaded":
    case "form-saved":
      return {
        status: state.formDiff ? "FINISHED LOADING" : state.status,
        dbForm: formClone,
        form: formClone,
        hasUnsavedChanges: false,
      };
    case "form-changed":
      return {
        ...state,
        dbForm: state.dbForm,
        form: formClone,
        hasUnsavedChanges: isDifferent(state.dbForm, formClone),
      };
    case "form-not-found":
      return {
        status: "FORM NOT FOUND",
        hasUnsavedChanges: false,
      };
    case "diff-loaded":
      return {
        ...state,
        status: state.form ? "FINISHED LOADING" : state.status,
        formDiff: action.diff,
      };
    case "diff-not-found":
      return {
        ...state,
        status: state.form ? "FINISHED LOADING" : state.status,
        formDiff: {},
      };
    default: {
      return state;
    }
  }
};

export default formPageReducer;
