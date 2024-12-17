import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ApiError from '../../api/ApiError';
import useGlobalTranslationsApi from '../../api/useGlobalTranslationsApi';
import { TranslationsContextValue } from './types';
import { getTranslationHttpError, TranslationError } from './utils/errorUtils';

const defaultValue: TranslationsContextValue<FormsApiGlobalTranslation> = {
  storedTranslations: {},
  isReady: false,
  loadTranslations: () => Promise.resolve(),
  saveTranslation: () => Promise.reject(),
  createNewTranslation: () => Promise.reject(),
};

const GlobalTranslationsContext = createContext<TranslationsContextValue<FormsApiGlobalTranslation>>(defaultValue);

const GlobalTranslationsProvider = ({ children }) => {
  const [formsApiState, setFormsApiState] = useState<{
    isReady: boolean;
    data?: FormsApiGlobalTranslation[];
  }>({
    isReady: false,
  });
  const translationsApi = useGlobalTranslationsApi();

  const loadTranslations = useCallback(async () => {
    const data = await translationsApi.get();
    setFormsApiState({ data, isReady: true });
  }, [translationsApi]);

  useEffect(() => {
    if (!formsApiState.isReady) {
      loadTranslations();
    }
  }, [formsApiState.isReady, loadTranslations]);

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

  const storedTranslationsMap = useMemo<Record<string, FormsApiGlobalTranslation>>(
    () => (formsApiState.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [formsApiState.data],
  );

  const value = {
    storedTranslations: storedTranslationsMap,
    loadTranslations,
    isReady: formsApiState.isReady,
    saveTranslation,
    createNewTranslation,
  };
  return <GlobalTranslationsContext.Provider value={value}>{children}</GlobalTranslationsContext.Provider>;
};

const useGlobalTranslations = () => useContext(GlobalTranslationsContext);

export { GlobalTranslationsContext, useGlobalTranslations };
export default GlobalTranslationsProvider;
