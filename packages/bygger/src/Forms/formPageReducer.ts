import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import cloneDeep from "lodash.clonedeep";

type ReducerAction = "form-loaded" | "form-not-found" | "form-changed" | "form-saved";
type Status = "LOADING" | "FINISHED LOADING" | "FORM NOT FOUND";
type ReducerActionType = { type: ReducerAction; form?: NavFormType };

interface ReducerState {
  status: Status;
  dbForm?: NavFormType;
  form?: NavFormType;
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
        status: "FINISHED LOADING",
        dbForm: formClone,
        form: formClone,
        hasUnsavedChanges: false,
      };
    case "form-changed":
      return {
        dbForm: state.dbForm,
        form: formClone,
        hasUnsavedChanges: isDifferent(state.dbForm, formClone),
      };
    case "form-not-found":
      return {
        status: "FORM NOT FOUND",
        hasUnsavedChanges: false,
      };
    default: {
      return state;
    }
  }
};

export default formPageReducer;
