import { FormsApiTranslation, TranslationLang, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from '../utils/errorUtils';
import { State } from './index';

type Status = 'INIT' | 'EDITING' | 'SAVING' | 'SAVED';

type InitializeAction = {
  type: 'INITIALIZE';
  payload: { initialChanges: FormsApiTranslation[] };
};
type UpdateAction = {
  type: 'UPDATE';
  payload: { original: FormsApiTranslation; lang: TranslationLang; value: string };
};
type AddAction = {
  type: 'ADD';
  payload: { key: string; nb: string; tag: TranslationTag };
};
type ValidationErrorAction = { type: 'VALIDATION_ERROR'; payload: { errors: TranslationError[] } };
type SaveStartedAction = { type: 'SAVE_STARTED' };
type SaveFinishedAction = { type: 'SAVE_FINISHED'; payload: { errors: TranslationError[] } };

const createDefaultGlobalTranslation = (tag: TranslationTag = 'skjematekster'): FormsApiTranslation => ({
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
export type {
  AddAction,
  InitializeAction,
  SaveFinishedAction,
  SaveStartedAction,
  Status,
  UpdateAction,
  ValidationErrorAction,
};
