import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { GlobalTranslationState, State } from '.';

const hasNewTranslationData = (state: GlobalTranslationState) => !!(state.new.nb || state.new.nn || state.new.en);

const getTranslationsForSaving = (state: State, activeKeys?: string[]): FormsApiTranslation[] =>
  Object.values(state.changes ?? {}).filter(
    ({ key, id, tag, nb, nn, en }) =>
      !activeKeys ||
      tag !== 'introPage' ||
      id !== undefined ||
      activeKeys.includes(key) ||
      [nb, nn, en].some((text) => !!text?.trim()),
  );

export { getTranslationsForSaving, hasNewTranslationData };
