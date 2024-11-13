import { FormsApiGlobalTranslation, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useFormsApiGlobalTranslations from '../../api/useFormsApiGlobalTranslations';

type TranslationsPerTag = Record<TranslationTag, FormsApiGlobalTranslation[]>;
interface GlobalTranslationsContextValue {
  translationsPerTag: TranslationsPerTag;
}

const defaultValue = {
  translationsPerTag: { skjematekster: [], grensesnitt: [], 'statiske-tekster': [], validering: [] },
};

const GlobalTranslationsContext = createContext<GlobalTranslationsContextValue>(defaultValue);

const GlobalTranslationsProvider = ({ children }) => {
  const [formsApiState, setFormsApiState] = useState<{ status: 'init' | 'done'; data?: FormsApiGlobalTranslation[] }>({
    status: 'init',
  });
  const translationsApi = useFormsApiGlobalTranslations();

  const loadTranslations = useCallback(async () => {
    if (formsApiState.status === 'init') {
      const data = await translationsApi.get();
      setFormsApiState({ status: 'done', data });
    }
  }, [formsApiState.status, translationsApi]);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const storedTranslationsMap = useMemo(() => {
    return formsApiState.data?.reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), []);
  }, [formsApiState.data]);

  console.log('storedTranslationsMap', storedTranslationsMap);

  const translationsPerTag: TranslationsPerTag = useMemo(() => {
    // const { grensesnitt } = TEXTS;
    // const flattenedTexts = flattenTextsForEditPanel(grensesnitt);
    // console.log('flattenedTexts', flattenedTexts);
    // const predefined = getAllPredefinedOriginalTexts();
    // console.log('predefined', predefined);
    // const translationKeys = getTranslationKeysForAllPredefinedTexts();
    // console.log('translationKeys', translationKeys);

    return {
      skjematekster: (formsApiState.data ?? []).filter((translation) => translation.tag === 'skjematekster'),
      grensesnitt: [],
      'statiske-tekster': [],
      validering: [],
    };
  }, [formsApiState.data]);

  const value = { translationsPerTag };
  return <GlobalTranslationsContext.Provider value={value}>{children}</GlobalTranslationsContext.Provider>;
};

export const useGlobalTranslations = () => useContext(GlobalTranslationsContext);
export default GlobalTranslationsProvider;
