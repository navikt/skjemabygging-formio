import {
  FormsApiGlobalTranslation,
  FormsApiTranslation,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from '../utils/errorUtils';

type Status = 'INIT' | 'EDITING' | 'SAVED';
interface State<Translation> {
  changes: Record<string, Translation>;
  new: FormsApiGlobalTranslation;
  errors: TranslationError[];
  state: Status;
}

type InitializeAction = {
  type: 'INITIALIZE';
  payload: { initialChanges: FormsApiTranslation[] };
};
type UpdateAction = {
  type: 'UPDATE';
  payload: { original: FormsApiTranslation; lang: TranslationLang; value: string };
};
type UpdateNewAction = {
  type: 'UPDATE_NEW';
  payload: { lang: TranslationLang; value: string };
};
type ValidationErrorAction = { type: 'VALIDATION_ERROR'; payload: { errors: TranslationError[] } };
type ClearErrorsAction = { type: 'CLEAR_ERRORS' };
type SavedAction = { type: 'SAVED'; payload: { defaultNew: FormsApiGlobalTranslation; errors: TranslationError[] } };

type Action =
  | InitializeAction
  | UpdateAction
  | UpdateNewAction
  | ValidationErrorAction
  | ClearErrorsAction
  | SavedAction;

const getUpdatedChanges = <Translation>(
  state: State<Translation>,
  args: {
    original: FormsApiTranslation;
    lang: TranslationLang;
    value: string;
  },
): Record<string, Translation> => {
  const { original, lang, value } = args;
  const existingChange = state.changes[original.key];
  return { ...state.changes, [original.key]: { ...original, ...existingChange, [lang]: value } };
};

const getUpdatedNew = <Translation>(
  state: State<Translation>,
  args: { lang: TranslationLang; value: string },
): FormsApiGlobalTranslation => {
  const { lang, value } = args;
  if (lang === 'nb') {
    return { ...state.new, key: value, [lang]: value };
  }
  return { ...state.new, [lang]: value };
};

const getErrors = <Translation>(state: State<Translation>, args: { errors: TranslationError[] }) => {
  return [...state.errors, ...args.errors];
};

const getResetChanges = <Translation extends FormsApiTranslation>(
  state: State<Translation>,
  args: { errors: TranslationError[] },
) => {
  if (args.errors.length === 0) {
    return {};
  }
  const keysOfErrors = args.errors.map((error) => error.key);
  return Object.values(state.changes).reduce(
    (acc, change) => (keysOfErrors.includes(change.key) ? { ...acc, [change.key]: change } : acc),
    {},
  );
};

const getResetNew = <Translation extends FormsApiTranslation>(
  state: State<Translation>,
  args: { defaultNew: FormsApiGlobalTranslation; errors: TranslationError[] },
): FormsApiGlobalTranslation => {
  if (args.errors.some((error) => error.key === state.new.key)) {
    return state.new;
  }
  return args.defaultNew;
};

const generateMap = <Translation extends FormsApiTranslation>(values: Translation[]) =>
  values.reduce((acc, value) => ({ ...acc, [value.key]: value }), {});

const reducer = <Translation extends FormsApiTranslation>(
  state: State<Translation>,
  action: Action,
): State<Translation> => {
  switch (action.type) {
    case 'INITIALIZE':
      return Object.keys(state.changes).length === 0
        ? { ...state, changes: generateMap(action.payload.initialChanges) }
        : state;
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

export type { State, Status };
export default reducer;
