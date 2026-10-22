import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { GlobalTranslationState, State } from '.';

const hasNewTranslationData = (state: GlobalTranslationState) => !!(state.new.nb || state.new.nn || state.new.en);

const isUnreferencedAndEmptyDraft = ({ key, id, nb, nn, en }: FormsApiTranslation, activeKeys: string[]) =>
  id === undefined && !activeKeys.includes(key) && ![nb, nn, en].some((text) => text?.trim());

const getTranslationsForSaving = (state: State, activeKeys?: string[]): FormsApiTranslation[] => {
  const translations = Object.values(state.changes ?? {});
  if (activeKeys === undefined) {
    return translations;
  }
  return translations.filter((translation) => !isUnreferencedAndEmptyDraft(translation, activeKeys));
};

export { getTranslationsForSaving, hasNewTranslationData };
