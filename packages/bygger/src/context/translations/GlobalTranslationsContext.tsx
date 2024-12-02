import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useFormsApiGlobalTranslations from '../../api/useFormsApiGlobalTranslations';
import { isTranslationError, TranslationError, TranslationsContextValue } from './types';

const defaultValue: TranslationsContextValue<FormsApiGlobalTranslation> = {
  storedTranslations: {},
  isReady: false,
  loadTranslations: () => Promise.resolve(),
  saveTranslations: () => Promise.resolve([]),
  createNewTranslation: () => Promise.resolve(undefined),
};

const GlobalTranslationsContext = createContext<TranslationsContextValue<FormsApiGlobalTranslation>>(defaultValue);

const GlobalTranslationsProvider = ({ children }) => {
  const [formsApiState, setFormsApiState] = useState<{
    isReady: boolean;
    data?: FormsApiGlobalTranslation[];
  }>({
    isReady: false,
  });
  const translationsApi = useFormsApiGlobalTranslations();

  const loadTranslations = useCallback(async () => {
    const data = await translationsApi.get();
    setFormsApiState({ data, isReady: true });
  }, [translationsApi]);

  useEffect(() => {
    if (!formsApiState.isReady) {
      loadTranslations();
    }
  }, [formsApiState.isReady, loadTranslations]);

  const saveTranslations = async (translations: FormsApiGlobalTranslation[]): Promise<Array<TranslationError>> => {
    const results = await Promise.all(
      translations.map((translation) => {
        if (translation.id) {
          return translationsApi.put(translation);
        } else {
          return translationsApi.post(translation);
        }
      }),
    );
    return results.filter(isTranslationError);
  };

  const createNewTranslation = async (
    translation: FormsApiGlobalTranslation,
  ): Promise<TranslationError | undefined> => {
    const result = await translationsApi.post(translation);
    if (isTranslationError(result)) {
      return { ...result, isNewTranslation: true };
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
    saveTranslations,
    createNewTranslation,
  };
  return <GlobalTranslationsContext.Provider value={value}>{children}</GlobalTranslationsContext.Provider>;
};

const useGlobalTranslations = () => useContext(GlobalTranslationsContext);

export { GlobalTranslationsContext, useGlobalTranslations };
export default GlobalTranslationsProvider;
