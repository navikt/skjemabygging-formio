import { FormsApiFormTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from '../utils/errorUtils';
import {
  ClearErrorsAction,
  generateMap,
  getErrors,
  getResetChanges,
  InitializeAction,
  SavedAction,
  Status,
  UpdateAction,
} from './reducerUtils';

type FormTranslationState = {
  changes: Record<string, FormsApiFormTranslation>;
  errors: TranslationError[];
  state: Status;
};

type FormTranslationAction = InitializeAction | UpdateAction<FormsApiFormTranslation> | ClearErrorsAction | SavedAction;

const getUpdatedFormTranslationChanges = (
  state: FormTranslationState,
  args: { original: FormsApiFormTranslation; lang: TranslationLang; value: string },
): Record<string, FormsApiFormTranslation> => {
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
      return { ...state, changes: getUpdatedFormTranslationChanges(state, action.payload), state: 'EDITING' };
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
    case 'SAVED':
      return {
        ...state,
        changes: getResetChanges(state, action.payload),
        errors: getErrors(state, action.payload),
        state: 'SAVED',
      };
    default:
      throw new Error();
  }
};

export type { FormTranslationState };
export default editFormTranslationsReducer;
