import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useFormTranslationsApi from '../../api/useFormTranslationsApi';

interface ContextValue {
  storedTranslations: Record<string, FormsApiFormTranslation>;
  translations: FormsApiFormTranslation[];
  isReady: boolean;
  loadTranslations: () => Promise<void>;
  saveTranslation: (translation: FormsApiFormTranslation) => Promise<FormsApiFormTranslation>;
  deleteTranslation: (id: number) => Promise<void>;
}

interface Props {
  children: ReactNode;
  formPath: string;
}

const defaultValue: ContextValue = {
  translations: [],
  storedTranslations: {},
  isReady: false,
  loadTranslations: () => Promise.resolve(),
  saveTranslation: () => Promise.reject(),
  deleteTranslation: () => Promise.reject(),
};

const FormTranslationsContext = createContext<ContextValue>(defaultValue);

const FormTranslationsProvider = ({ children, formPath }: Props) => {
  const [state, setState] = useState<{ isReady: boolean; data?: FormsApiFormTranslation[] }>({ isReady: false });
  const translationsApi = useFormTranslationsApi();

  const loadTranslations = useCallback(async () => {
    const data = await translationsApi.get(formPath);
    setState({ data, isReady: true });
  }, [formPath, translationsApi]);

  useEffect(() => {
    if (!state.isReady) {
      loadTranslations();
    }
  }, [loadTranslations, state.isReady]);

  const saveTranslation = async (translation: FormsApiFormTranslation): Promise<FormsApiFormTranslation> => {
    if (translation.id) {
      return translationsApi.put(formPath, translation);
    } else {
      return translationsApi.post(formPath, translation);
    }
  };

  const deleteTranslation = async (id: number) => {
    await translationsApi.delete(formPath, id);
    await loadTranslations();
  };

  const storedTranslations = useMemo<Record<string, FormsApiFormTranslation>>(
    () => (state.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [state.data],
  );

  const value = {
    translations: state.data ?? [],
    storedTranslations,
    isReady: state.isReady,
    loadTranslations,
    saveTranslation,
    deleteTranslation,
  };

  return <FormTranslationsContext.Provider value={value}>{children}</FormTranslationsContext.Provider>;
};

const useFormTranslations = () => useContext(FormTranslationsContext);
export { useFormTranslations };
export default FormTranslationsProvider;
