import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { GlobalTranslationState, State } from '.';

const hasNewTranslationData = (state: GlobalTranslationState) => !!(state.new.nb || state.new.nn || state.new.en);

const getTranslationsForSaving = <Translation extends FormsApiTranslation>(state: State): Translation[] =>
  Object.values(state.changes ?? {});

export { getTranslationsForSaving, hasNewTranslationData };
