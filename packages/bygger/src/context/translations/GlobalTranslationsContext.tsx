import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useMemo } from 'react';
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
import { useAsyncLoader } from './utils/useAsyncLoader';

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

  const translationsApi = useGlobalTranslationsApi();

  const fetchTranslations = useCallback(async () => translationsApi.get(), [translationsApi]);

  const { data, isReady, reload, setData } = useAsyncLoader(fetchTranslations);

  const loadTranslations = useCallback(async () => {
    await reload();
  }, [reload]);

  const storedTranslationsMap = useMemo<Record<string, FormsApiTranslation>>(
    () => (data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [data],
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
      setData((current) => current?.filter((translation) => translation.id !== id));
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
    translations: data ?? [],
    storedTranslations: storedTranslationsMap,
    translationsPerTag,
    loadTranslations,
    isReady,
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
