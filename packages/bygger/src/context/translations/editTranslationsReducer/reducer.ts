import {
  FormsApiGlobalTranslation,
  FormsApiTranslation,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from '../types';

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
  payload: { original: FormsApiTranslation; property: TranslationLang; value: string };
};
type UpdateNewAction = {
  type: 'UPDATE_NEW';
  payload: { property: TranslationLang; value: string };
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
    property: TranslationLang;
    value: string;
  },
): Record<string, Translation> => {
  const { original, property, value } = args;
  const existingChange = state.changes[original.key];
  return { ...state.changes, [original.key]: { ...original, ...existingChange, [property]: value } };
};

const getUpdatedNew = <Translation>(
  state: State<Translation>,
  args: { property: TranslationLang; value: string },
): FormsApiGlobalTranslation => {
  const { property, value } = args;
  if (property === 'nb') {
    return { ...state.new, key: value, [property]: value };
  }
  return { ...state.new, [property]: value };
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
