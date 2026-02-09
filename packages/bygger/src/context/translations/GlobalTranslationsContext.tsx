import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
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
  translations: FormsApiTranslation[];
  storedTranslations: Record<string, FormsApiTranslation>;
  translationsPerTag: Record<GlobalTranslationTag, FormsApiTranslation[]>;
  isReady: boolean;
  loadTranslations: () => Promise<void>;
  saveTranslation: (translation: FormsApiTranslation) => Promise<FormsApiTranslation>;
  createNewTranslation: (
    translation: FormsApiTranslation,
  ) => Promise<{ response?: FormsApiTranslation; error?: TranslationError }>;
  deleteTranslation: (id: number) => Promise<void>;
  publish: () => Promise<void>;
}

const defaultValue: ContextValue = {
  translations: [],
  storedTranslations: {},
  translationsPerTag: { introPage: [], skjematekster: [], grensesnitt: [], 'statiske-tekster': [], validering: [] },
  isReady: false,
  loadTranslations: () => Promise.resolve(),
  saveTranslation: () => Promise.reject(),
  createNewTranslation: () => Promise.reject(),
  deleteTranslation: () => Promise.reject(),
  publish: () => Promise.reject(),
};

const GlobalTranslationsContext = createContext<ContextValue>(defaultValue);

const GlobalTranslationsProvider = ({ children }) => {
  const feedbackEmit = useFeedbackEmit();

  const [state, setState] = useState<{
    isReady: boolean;
    data?: FormsApiTranslation[];
  }>({
    isReady: false,
  });
  const translationsApi = useGlobalTranslationsApi();

  const fetchTranslations = useCallback(async () => translationsApi.get(), [translationsApi]);

  const loadTranslations = useCallback(async () => {
    const data = await fetchTranslations();
    setState({ data, isReady: true });
  }, [fetchTranslations]);

  useEffect(() => {
    if (state.isReady) {
      return;
    }

    let cancelled = false;

    fetchTranslations()
      .then((data) => {
        if (cancelled) return;
        setState({ data, isReady: true });
      })
      .catch(() => {
        if (cancelled) return;
        setState((current) => ({ ...current, isReady: true }));
      });

    return () => {
      cancelled = true;
    };
  }, [fetchTranslations, state.isReady]);

  const storedTranslationsMap = useMemo<Record<string, FormsApiTranslation>>(
    () => (state.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [state.data],
  );

  const translationsPerTag = useMemo(() => generateAndPopulateTags(storedTranslationsMap), [storedTranslationsMap]);

  const saveTranslation = async (translation: FormsApiTranslation): Promise<FormsApiTranslation> => {
    if (!translation.key) {
      throw new Error('Translation key is required');
    }
    if (translation.id) {
      return translationsApi.put(translation);
    } else {
      return translationsApi.post(translation);
    }
  };

  const createNewTranslation = async (
    translation: FormsApiTranslation,
  ): Promise<{ response?: FormsApiTranslation; error?: TranslationError }> => {
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

  const deleteTranslation = async (id: number) => {
    const result = await translationsApi.delete(id);
    if (result) {
      setState((current) => ({
        ...current,
        data: current.data?.filter((translation) => translation.id !== id),
      }));
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
    deleteTranslation,
    publish,
  };
  return <GlobalTranslationsContext.Provider value={value}>{children}</GlobalTranslationsContext.Provider>;
};

const useGlobalTranslations = () => useContext(GlobalTranslationsContext);

export { useGlobalTranslations };
export default GlobalTranslationsProvider;
