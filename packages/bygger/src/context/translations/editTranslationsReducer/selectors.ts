import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { State } from './reducer';

const hasNewTranslationData = (state: State) => !!(state.new.nb || state.new.nn || state.new.en);

const getTranslationsForSaving = (state: State): FormsApiGlobalTranslation[] => Object.values(state.changes ?? {});

export { getTranslationsForSaving, hasNewTranslationData };
