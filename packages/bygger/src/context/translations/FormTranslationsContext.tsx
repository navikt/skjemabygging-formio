import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import useFormTranslationsApi from '../../api/useFormTranslationsApi';
import { TimestampEvent } from '../../Forms/status/types';
import { useAsyncLoader } from './utils/useAsyncLoader';
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

const FormTranslationsProvider = ({ children, formPath }: Props) => {
  const translationsApi = useFormTranslationsApi();

  const fetchTranslations = useCallback(async () => translationsApi.get(formPath), [formPath, translationsApi]);

  const { data, isReady, reload, setData } = useAsyncLoader(fetchTranslations);

  const loadTranslations = useCallback(async () => {
    await reload();
  }, [reload]);

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
      setData((current) => current?.filter((translation) => translation.id !== id));
    }
  };

  const storedTranslations = useMemo<Record<string, FormsApiTranslation>>(
    () => (data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [data],
  );

  const lastSave = useMemo<TimestampEvent | undefined>(() => findLastSaveTimestamp(data ?? []), [data]);

  const value = {
    translations: data ?? [],
    storedTranslations,
    isReady,
    lastSave,
    loadTranslations,
    saveTranslation,
    deleteTranslation,
  };

  return <FormTranslationsContext.Provider value={value}>{children}</FormTranslationsContext.Provider>;
};

const useFormTranslations = () => useContext(FormTranslationsContext);
export { useFormTranslations };
export default FormTranslationsProvider;
