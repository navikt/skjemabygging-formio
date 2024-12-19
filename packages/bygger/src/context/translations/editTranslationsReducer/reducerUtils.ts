import {
  FormsApiGlobalTranslation,
  FormsApiTranslation,
  TranslationLang,
  TranslationTag,
} from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from '../utils/errorUtils';
import { State } from './index';

type Status = 'INIT' | 'EDITING' | 'SAVED';

type InitializeAction = {
  type: 'INITIALIZE';
  payload: { initialChanges: FormsApiTranslation[] };
};
type UpdateAction<Translation> = {
  type: 'UPDATE';
  payload: { original: Translation; lang: TranslationLang; value: string };
};
type ClearErrorsAction = { type: 'CLEAR_ERRORS' };
type SavedAction = { type: 'SAVED'; payload: { errors: TranslationError[] } };

const createDefaultGlobalTranslation = (tag: TranslationTag = 'skjematekster'): FormsApiGlobalTranslation => ({
  key: '',
  tag,
  nb: '',
  nn: '',
  en: '',
});

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

const generateMap = <Translation extends FormsApiTranslation>(values: Translation[]) =>
  values.reduce((acc, value) => ({ ...acc, [value.key]: value }), {});

export { createDefaultGlobalTranslation, generateMap, getErrors, getResetChanges };
export type { ClearErrorsAction, InitializeAction, SavedAction, Status, UpdateAction };
