import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationLang } from '../EditTranslationsContext';

export type TranslationError = { type: 'MISSING_KEY_VALIDATION'; key: string; isNewTranslation?: boolean };
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
type SavedAction = { type: 'SAVED'; payload: { defaultNew: FormsApiGlobalTranslation } };

type Action = UpdateAction | UpdateNewAction | ValidationErrorAction | ClearErrorsAction | SavedAction;

const getUpdatedChanges = (
  changes: Record<string, FormsApiGlobalTranslation>,
  args: {
    original: FormsApiGlobalTranslation;
    property: TranslationLang;
    value: string;
  },
): Record<string, FormsApiGlobalTranslation> => {
  const { original, property, value } = args;
  const existingChange = changes[original.key];
  return { ...changes, [original.key]: { ...original, ...existingChange, [property]: value } };
};

const getUpdatedNew = (
  current: FormsApiGlobalTranslation,
  args: { property: TranslationLang; value: string },
): FormsApiGlobalTranslation => {
  const { property, value } = args;
  if (property === 'nb') {
    return { ...current, key: value, [property]: value };
  }
  return { ...current, [property]: value };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, changes: getUpdatedChanges(state.changes, action.payload), state: 'EDITING' };
    case 'UPDATE_NEW':
      return { ...state, new: getUpdatedNew(state.new, action.payload), state: 'EDITING' };
    case 'VALIDATION_ERROR':
      return { ...state, errors: action.payload.errors };
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    case 'SAVED':
      return { ...state, changes: {}, new: action.payload.defaultNew, state: 'SAVED' };
    default:
      throw new Error();
  }
};

export default reducer;
