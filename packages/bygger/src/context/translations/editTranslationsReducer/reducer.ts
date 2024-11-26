import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationLang } from '../EditTranslationsContext';
import { TranslationError } from '../types';

export interface State {
  changes: Record<string, FormsApiGlobalTranslation>;
  new: FormsApiGlobalTranslation;
  errors: TranslationError[];
  state: 'INIT' | 'EDITING' | 'SAVED';
}

type UpdateAction = {
  type: 'UPDATE';
  payload: { original: FormsApiGlobalTranslation; property: TranslationLang; value: string };
};
type UpdateNewAction = {
  type: 'UPDATE_NEW';
  payload: { property: TranslationLang; value: string };
};
type ValidationErrorAction = { type: 'VALIDATION_ERROR'; payload: { errors: TranslationError[] } };
type ClearErrorsAction = { type: 'CLEAR_ERRORS' };
type SavedAction = { type: 'SAVED'; payload: { defaultNew: FormsApiGlobalTranslation; errors: TranslationError[] } };

type Action = UpdateAction | UpdateNewAction | ValidationErrorAction | ClearErrorsAction | SavedAction;

const getUpdatedChanges = (
  state: State,
  args: {
    original: FormsApiGlobalTranslation;
    property: TranslationLang;
    value: string;
  },
): Record<string, FormsApiGlobalTranslation> => {
  const { original, property, value } = args;
  const existingChange = state.changes[original.key];
  return { ...state.changes, [original.key]: { ...original, ...existingChange, [property]: value } };
};

const getUpdatedNew = (state: State, args: { property: TranslationLang; value: string }): FormsApiGlobalTranslation => {
  const { property, value } = args;
  if (property === 'nb') {
    return { ...state.new, key: value, [property]: value };
  }
  return { ...state.new, [property]: value };
};

const getErrors = (state: State, args: { errors: TranslationError[] }) => {
  return [...state.errors, ...args.errors];
};

const getResetChanges = (state: State, args: { errors: TranslationError[] }) => {
  if (args.errors.length === 0) {
    return {};
  }
  const keysOfErrors = args.errors.map((error) => error.key);
  return Object.values(state.changes).reduce(
    (acc, change) => (keysOfErrors.includes(change.key) ? { ...acc, [change.key]: change } : acc),
    {},
  );
};

const getResetNew = (state: State, args: { defaultNew: FormsApiGlobalTranslation; errors: TranslationError[] }) => {
  if (args.errors.some((error) => error.key === state.new.key)) {
    return state.new;
  }
  return args.defaultNew;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, changes: getUpdatedChanges(state, action.payload), state: 'EDITING' };
    case 'UPDATE_NEW':
      return { ...state, new: getUpdatedNew(state, action.payload), state: 'EDITING' };
    case 'VALIDATION_ERROR':
      return { ...state, errors: action.payload.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    case 'SAVED':
      return {
        ...state,
        changes: getResetChanges(state, action.payload),
        new: getResetNew(state, action.payload),
        errors: getErrors(state, action.payload),
        state: 'SAVED',
      };
    default:
      throw new Error();
  }
};

export default reducer;
