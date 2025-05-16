import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from '../utils/errorUtils';
import {
  createDefaultGlobalTranslation,
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

type GlobalTranslationState = {
  changes: Record<string, FormsApiTranslation>;
  new: FormsApiTranslation;
  errors: TranslationError[];
  status: Status;
};

type UpdateNewAction = {
  type: 'UPDATE_NEW';
  payload: { lang: TranslationLang; value: string };
};

type GlobalTranslationAction =
  | InitializeAction
  | UpdateAction<FormsApiTranslation>
  | UpdateNewAction
  | ValidationErrorAction
  | SaveStartedAction
  | SaveFinishedAction;

const getUpdatedGlobalTranslationChanges = (
  state: GlobalTranslationState,
  args: { original: FormsApiTranslation; lang: TranslationLang; value: string },
): Record<string, FormsApiTranslation> => {
  const { original, lang, value } = args;
  const existingChange = state.changes[original.key];
  return { ...state.changes, [original.key]: { ...original, ...existingChange, [lang]: value } };
};

const getUpdatedNew = (
  state: GlobalTranslationState,
  args: { lang: TranslationLang; value: string },
): FormsApiTranslation => {
  const { lang, value } = args;
  if (lang === 'nb') {
    return { ...state.new, key: value, [lang]: value };
  }
  return { ...state.new, [lang]: value };
};

const getResetNew = (state: GlobalTranslationState, args: { errors: TranslationError[] }): FormsApiTranslation => {
  if (args.errors.some((error) => error.key === state.new.key)) {
    return state.new;
  }
  return createDefaultGlobalTranslation();
};

const editGlobalTranlationReducer = (
  state: GlobalTranslationState,
  action: GlobalTranslationAction,
): GlobalTranslationState => {
  switch (action.type) {
    case 'INITIALIZE':
      return Object.keys(state.changes).length === 0
        ? { ...state, changes: generateMap(action.payload.initialChanges) }
        : state;
    case 'UPDATE':
      return { ...state, changes: getUpdatedGlobalTranslationChanges(state, action.payload), status: 'EDITING' };
    case 'UPDATE_NEW':
      return { ...state, new: getUpdatedNew(state, action.payload), status: 'EDITING' };
    case 'VALIDATION_ERROR':
      return { ...state, errors: action.payload.errors };
    case 'SAVE_STARTED':
      return { ...state, errors: [] };
    case 'SAVE_FINISHED':
      return {
        ...state,
        changes: getResetChanges(state, action.payload),
        new: getResetNew(state, action.payload),
        errors: getErrors(state, action.payload),
        status: 'SAVED',
      };
    default:
      throw new Error();
  }
};

export type { GlobalTranslationState };
export default editGlobalTranlationReducer;
