import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useFormTranslationsApi from '../../api/useFormTranslationsApi';
import { TimestampEvent } from '../../Forms/status/types';
import { findLastSaveTimestamp } from './utils/utils';

interface ContextValue {
  storedTranslations: Record<string, FormsApiTranslation>;
  translations: FormsApiTranslation[];
  lastSave: TimestampEvent | undefined;
  isReady: boolean;
  loadTranslations: () => Promise<void>;
  saveTranslation: (translation: FormsApiTranslation) => Promise<FormsApiTranslation>;
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
  lastSave: undefined,
  loadTranslations: () => Promise.resolve(),
  saveTranslation: () => Promise.reject(),
  deleteTranslation: () => Promise.reject(),
};

const FormTranslationsContext = createContext<ContextValue>(defaultValue);

type State = { isReady: boolean; data?: FormsApiTranslation[]; lastSave?: TimestampEvent | undefined };

const FormTranslationsProvider = ({ children, formPath }: Props) => {
  const [state, setState] = useState<State>({ isReady: false });
  const translationsApi = useFormTranslationsApi();

  const loadTranslations = useCallback(async () => {
    const data = await translationsApi.get(formPath);
    setState({ data, isReady: true, lastSave: findLastSaveTimestamp(data) });
  }, [formPath, translationsApi]);

  useEffect(() => {
    if (!state.isReady) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadTranslations();
    }
  }, [loadTranslations, state.isReady]);

  const saveTranslation = async (translation: FormsApiTranslation): Promise<FormsApiTranslation> => {
    if (!translation.key) {
      throw new Error('Translation key is required');
    }
    if (translation.id) {
      return translationsApi.put(formPath, translation);
    } else {
      return translationsApi.post(formPath, translation);
    }
  };

  const deleteTranslation = async (id: number) => {
    const result = await translationsApi.delete(formPath, id);
    if (result) {
      setState((current) => ({
        ...current,
        data: current.data?.filter((translation) => translation.id !== id),
      }));
    }
  };

  const storedTranslations = useMemo<Record<string, FormsApiTranslation>>(
    () => (state.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [state.data],
  );

  const value = {
    translations: state.data ?? [],
    storedTranslations,
    isReady: state.isReady,
    lastSave: state.lastSave,
    loadTranslations,
    saveTranslation,
    deleteTranslation,
  };

  return <FormTranslationsContext.Provider value={value}>{children}</FormTranslationsContext.Provider>;
};

const useFormTranslations = () => useContext(FormTranslationsContext);
export { useFormTranslations };
export default FormTranslationsProvider;
