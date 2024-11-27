import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import useFormsApiGlobalTranslations from '../../api/useFormsApiGlobalTranslations';
import { isTranslationError, TranslationError, TranslationsContextValue } from './types';

const defaultValue: TranslationsContextValue = {
  storedTranslations: {},
  loadTranslations: () => Promise.resolve(),
  saveTranslations: () => Promise.resolve([]),
  createNewTranslation: () => Promise.resolve(undefined),
};

const GlobalTranslationsContext = createContext<TranslationsContextValue>(defaultValue);

const GlobalTranslationsProvider = ({ children }) => {
  const [formsApiState, setFormsApiState] = useState<{
    status: 'init' | 'ready' | 'saving';
    data?: FormsApiGlobalTranslation[];
  }>({
    status: 'init',
  });
  const translationsApi = useFormsApiGlobalTranslations();

  const loadTranslations = useCallback(async () => {
    const data = await translationsApi.get();
    setFormsApiState({ status: 'ready', data });
  }, [translationsApi]);

  useEffect(() => {
    if (formsApiState.status === 'init') {
      loadTranslations();
    }
  }, [formsApiState.status, loadTranslations]);

  const saveTranslations = async (translations: FormsApiGlobalTranslation[]): Promise<Array<TranslationError>> => {
    setFormsApiState((state) => ({ ...state, status: 'saving' }));
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
    setFormsApiState((state) => ({ ...state, status: 'saving' }));
    const result = await translationsApi.post(translation);
    if (isTranslationError(result)) {
      return { ...result, isNewTranslation: true };
    }
  };

  const storedTranslationsMap = useMemo<Record<string, FormsApiGlobalTranslation>>(() => {
    return (formsApiState.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {});
  }, [formsApiState.data]);

  const value = {
    storedTranslations: storedTranslationsMap,
    loadTranslations,
    saveTranslations,
    createNewTranslation,
  };
  return <GlobalTranslationsContext.Provider value={value}>{children}</GlobalTranslationsContext.Provider>;
};

export { GlobalTranslationsContext };
export default GlobalTranslationsProvider;
