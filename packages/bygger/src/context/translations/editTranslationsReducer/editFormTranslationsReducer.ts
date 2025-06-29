import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from '../utils/errorUtils';
import {
  AddAction,
  generateMap,
  getErrors,
  getResetChanges,
  InitializeAction,
  SaveFinishedAction,
  SaveStartedAction,
  Status,
  UpdateAction,
  ValidationErrorAction,
} from './reducerUtils';

type FormTranslationState = {
  changes: Record<string, FormsApiTranslation>;
  errors: TranslationError[];
  status: Status;
};

type FormTranslationAction =
  | InitializeAction
  | UpdateAction
  | AddAction
  | ValidationErrorAction
  | SaveStartedAction
  | SaveFinishedAction;

const getUpdatedFormTranslationChanges = (
  state: FormTranslationState,
  args: { original: FormsApiTranslation; lang: TranslationLang; value: string },
): Record<string, FormsApiTranslation> => {
  const { original, lang, value } = args;
  const existingChange = state.changes[original.key];
  return { ...state.changes, [original.key]: { ...original, ...existingChange, [lang]: value } };
};

const editFormTranslationsReducer = (
  state: FormTranslationState,
  action: FormTranslationAction,
): FormTranslationState => {
  switch (action.type) {
    case 'INITIALIZE':
      return Object.keys(state.changes).length === 0
        ? { ...state, changes: generateMap(action.payload.initialChanges) }
        : state;
    case 'UPDATE':
      return { ...state, changes: getUpdatedFormTranslationChanges(state, action.payload), status: 'EDITING' };
    case 'ADD':
      return { ...state, changes: { ...state.changes, [action.payload.key]: action.payload } };
    case 'VALIDATION_ERROR':
      return { ...state, errors: action.payload.errors };
    case 'SAVE_STARTED':
      return { ...state, errors: [], status: 'SAVING' };
    case 'SAVE_FINISHED':
      return {
        ...state,
        changes: getResetChanges(state, action.payload),
        errors: getErrors(state, action.payload),
        status: 'SAVED',
      };
    default:
      throw new Error();
  }
};

export type { FormTranslationState };
export default editFormTranslationsReducer;
