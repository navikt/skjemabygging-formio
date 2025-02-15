import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ApiError from '../../api/ApiError';
import useGlobalTranslationsApi from '../../api/useGlobalTranslationsApi';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import { getTranslationHttpError, TranslationError } from './utils/errorUtils';
import {
  generateAndPopulateTags,
  getMissingGlobalTranslationsErrorMessage,
  getTagsWithIncompleteTranslations,
  GlobalTranslationTag,
} from './utils/globalTranslationsUtils';

interface ContextValue {
  translations: FormsApiGlobalTranslation[];
  storedTranslations: Record<string, FormsApiGlobalTranslation>;
  translationsPerTag: Record<GlobalTranslationTag, FormsApiGlobalTranslation[]>;
  isReady: boolean;
  loadTranslations: () => Promise<void>;
  saveTranslation: (translation: FormsApiGlobalTranslation) => Promise<FormsApiGlobalTranslation>;
  createNewTranslation: (
    translation: FormsApiGlobalTranslation,
  ) => Promise<{ response?: FormsApiGlobalTranslation; error?: TranslationError }>;
  publish: () => Promise<void>;
}

const defaultValue: ContextValue = {
  translations: [],
  storedTranslations: {},
  translationsPerTag: { skjematekster: [], grensesnitt: [], 'statiske-tekster': [], validering: [] },
  isReady: false,
  loadTranslations: () => Promise.resolve(),
  saveTranslation: () => Promise.reject(),
  createNewTranslation: () => Promise.reject(),
  publish: () => Promise.reject(),
};

const GlobalTranslationsContext = createContext<ContextValue>(defaultValue);

const GlobalTranslationsProvider = ({ children }) => {
  const feedbackEmit = useFeedbackEmit();

  const [state, setState] = useState<{
    isReady: boolean;
    data?: FormsApiGlobalTranslation[];
  }>({
    isReady: false,
  });
  const translationsApi = useGlobalTranslationsApi();

  const loadTranslations = useCallback(async () => {
    const data = await translationsApi.get();
    setState({ data, isReady: true });
  }, [translationsApi]);

  useEffect(() => {
    if (!state.isReady) {
      loadTranslations();
    }
  }, [state.isReady, loadTranslations]);

  const storedTranslationsMap = useMemo<Record<string, FormsApiGlobalTranslation>>(
    () => (state.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [state.data],
  );

  const translationsPerTag = useMemo(() => generateAndPopulateTags(storedTranslationsMap), [storedTranslationsMap]);

  const saveTranslation = async (translation: FormsApiGlobalTranslation): Promise<FormsApiGlobalTranslation> => {
    if (translation.id) {
      return translationsApi.put(translation);
    } else {
      return translationsApi.post(translation);
    }
  };

  const createNewTranslation = async (
    translation: FormsApiGlobalTranslation,
  ): Promise<{ response?: FormsApiGlobalTranslation; error?: TranslationError }> => {
    try {
      const result = await translationsApi.post(translation);
      return { response: result };
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: getTranslationHttpError(error.httpStatus, translation, true) };
      } else {
        throw error;
      }
    }
  };

  const publish = async () => {
    const tagsWithMissingTranslations = getTagsWithIncompleteTranslations(translationsPerTag);

    if (tagsWithMissingTranslations.length > 0) {
      feedbackEmit.error(getMissingGlobalTranslationsErrorMessage(tagsWithMissingTranslations));
    } else {
      await translationsApi.publish();
      await loadTranslations();
    }
  };

  const value = {
    translations: state.data ?? [],
    storedTranslations: storedTranslationsMap,
    translationsPerTag,
    loadTranslations,
    isReady: state.isReady,
    saveTranslation,
    createNewTranslation,
    publish,
  };
  return <GlobalTranslationsContext.Provider value={value}>{children}</GlobalTranslationsContext.Provider>;
};

const useGlobalTranslations = () => useContext(GlobalTranslationsContext);

export { useGlobalTranslations };
export default GlobalTranslationsProvider;
