import { FormsApiFormTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ApiError from '../../api/ApiError';
import useFormTranslationsApi from '../../api/useFormTranslationsApi';
import { TranslationsContextValue } from './types';
import { getTranslationHttpError, isTranslationError, TranslationError } from './utils/errorUtils';

interface Props {
  children: ReactNode;
  formPath: string;
}

const defaultValue: TranslationsContextValue<FormsApiFormTranslation> = {
  storedTranslations: {},
  isReady: false,
  loadTranslations: () => Promise.resolve(),
  saveTranslations: () => Promise.resolve([]),
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

  const saveTranslations = async (
    translations: FormsApiFormTranslation[],
  ): Promise<Array<{ response?: FormsApiFormTranslation; error?: TranslationError }>> => {
    const results = await Promise.all(
      translations.map((translation) => {
        try {
          if (translation.id) {
            return translationsApi.put(formPath, translation);
          } else {
            return translationsApi.post(formPath, translation);
          }
        } catch (error) {
          if (error instanceof ApiError) {
            return getTranslationHttpError(error.httpStatus, translation);
          } else {
            throw error;
          }
        }
      }),
    );
    return results.map((result) => (isTranslationError(result) ? { error: result } : { response: result }));
  };

  const storedTranslations = useMemo<Record<string, FormsApiFormTranslation>>(
    () => (state.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {}),
    [state.data],
  );

  const value = {
    storedTranslations,
    isReady: state.isReady,
    loadTranslations,
    saveTranslations,
    saveTranslation,
  };

  return <FormTranslationsContext.Provider value={value}>{children}</FormTranslationsContext.Provider>;
};

const useFormTranslations = () => useContext(FormTranslationsContext);
export { FormTranslationsContext, useFormTranslations };
export default FormTranslationsProvider;
