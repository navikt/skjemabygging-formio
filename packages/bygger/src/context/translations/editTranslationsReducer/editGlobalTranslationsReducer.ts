import { FormsApiGlobalTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
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
} from './reducerUtils';

type GlobalTranslationState = {
  changes: Record<string, FormsApiGlobalTranslation>;
  new: FormsApiGlobalTranslation;
  errors: TranslationError[];
  status: Status;
};

type UpdateNewAction = {
  type: 'UPDATE_NEW';
  payload: { lang: TranslationLang; value: string };
};
type ValidationErrorAction = { type: 'VALIDATION_ERROR'; payload: { errors: TranslationError[] } };

type GlobalTranslationAction =
  | InitializeAction
  | UpdateAction<FormsApiGlobalTranslation>
  | UpdateNewAction
  | ValidationErrorAction
  | SaveStartedAction
  | SaveFinishedAction;

const getUpdatedGlobalTranslationChanges = (
  state: GlobalTranslationState,
  args: { original: FormsApiGlobalTranslation; lang: TranslationLang; value: string },
): Record<string, FormsApiGlobalTranslation> => {
  const { original, lang, value } = args;
  const existingChange = state.changes[original.key];
  return { ...state.changes, [original.key]: { ...original, ...existingChange, [lang]: value } };
};

const getUpdatedNew = (
  state: GlobalTranslationState,
  args: { lang: TranslationLang; value: string },
): FormsApiGlobalTranslation => {
  const { lang, value } = args;
  if (lang === 'nb') {
    return { ...state.new, key: value, [lang]: value };
  }
  return { ...state.new, [lang]: value };
};

const getResetNew = (
  state: GlobalTranslationState,
  args: { errors: TranslationError[] },
): FormsApiGlobalTranslation => {
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
