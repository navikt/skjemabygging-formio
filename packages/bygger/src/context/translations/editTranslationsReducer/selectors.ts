import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { State } from './reducer';

const hasNewTranslationData = <Translation extends FormsApiTranslation>(state: State<Translation>) =>
  !!(state.new.nb || state.new.nn || state.new.en);

const getTranslationsForSaving = <Translation extends FormsApiTranslation>(state: State<Translation>): Translation[] =>
  Object.values(state.changes ?? {});

export { getTranslationsForSaving, hasNewTranslationData };
