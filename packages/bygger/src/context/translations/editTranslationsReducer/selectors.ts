import { State } from './reducer';

const hasNewTranslationData = (state: State) => !!(state.new.nb || state.new.nn || state.new.en);

const getTranslationsForSaving = (state: State) =>
  hasNewTranslationData(state) ? { ...state.changes, [state.new.key]: state.new } : state.changes;

export { getTranslationsForSaving, hasNewTranslationData };
