import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useFormTranslationsApi from '../../api/useFormTranslationsApi';
import { TranslationsContextValue } from './types';

interface Props {
  children: ReactNode;
  formPath: string;
}

const defaultValue: TranslationsContextValue<FormsApiFormTranslation> = {
  storedTranslations: {},
  isReady: false,
  loadTranslations: () => Promise.resolve(),
  saveTranslation: () => Promise.reject(),
};

const FormTranslationsContext = createContext<TranslationsContextValue<FormsApiFormTranslation>>(defaultValue);

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

  const storedTranslations = useMemo<Record<string, FormsApiFormTranslation>>(
    () => (state.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [state.data],
  );

  const value = {
    storedTranslations,
    isReady: state.isReady,
    loadTranslations,
    saveTranslation,
  };

  return <FormTranslationsContext.Provider value={value}>{children}</FormTranslationsContext.Provider>;
};

const useFormTranslations = () => useContext(FormTranslationsContext);
export { useFormTranslations };
export default FormTranslationsProvider;