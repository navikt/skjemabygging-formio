import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { GlobalTranslationState, State } from '.';

const hasNewTranslationData = (state: GlobalTranslationState) => !!(state.new.nb || state.new.nn || state.new.en);

const getTranslationsForSaving = (state: State): FormsApiTranslation[] => Object.values(state.changes ?? {});

export { getTranslationsForSaving, hasNewTranslationData };
