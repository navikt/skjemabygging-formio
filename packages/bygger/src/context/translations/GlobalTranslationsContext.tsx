import { FormsApiGlobalTranslation, TEXTS, TranslationTag } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useFormsApiGlobalTranslations from '../../api/useFormsApiGlobalTranslations';
import { generateAndPopulateTag } from '../../translations/utils/editGlobalTranslationsUtils';
import { TranslationError, translationErrorTypes } from './editTranslationsReducer/reducer';

const isTranslationError = (translationOrError: unknown): translationOrError is TranslationError =>
  translationErrorTypes.includes((translationOrError as TranslationError)?.type);

type TranslationsPerTag = Record<TranslationTag, FormsApiGlobalTranslation[]>;
interface GlobalTranslationsContextValue {
  translationsPerTag: TranslationsPerTag;
  storedTranslations: Record<string, FormsApiGlobalTranslation>;
  saveTranslations: (translations: FormsApiGlobalTranslation[]) => Promise<Array<TranslationError>>;
}

const defaultValue = {
  translationsPerTag: { skjematekster: [], grensesnitt: [], 'statiske-tekster': [], validering: [] },
  storedTranslations: {},
  saveTranslations: (_translations: FormsApiGlobalTranslation[]) => Promise.resolve([]),
};

const GlobalTranslationsContext = createContext<GlobalTranslationsContextValue>(defaultValue);

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
    await loadTranslations();
    return results.filter(isTranslationError);
  };

  const storedTranslationsMap = useMemo<Record<string, FormsApiGlobalTranslation>>(() => {
    return (formsApiState.data ?? []).reduce((acc, translation) => ({ ...acc, [translation.key]: translation }), {});
  }, [formsApiState.data]);

  const translationsPerTag: TranslationsPerTag = useMemo(() => {
    const { common, grensesnitt, statiske, pdfStatiske, validering } = TEXTS;
    // const flattenedTexts = flattenTextsForEditPanel(grensesnitt);
    // console.log('flattenedTexts', flattenedTexts);
    // const predefined = getAllPredefinedOriginalTexts();
    // console.log('predefined', predefined);
    // const translationKeys = getTranslationKeysForAllPredefinedTexts();
    // console.log('translationKeys', translationKeys);

    // const grensesnittTranslations = objectUtils.flattenToArray(grensesnitt, ([entryKey, value], parentKey) => {
    //   const key = objectUtils.concatKeys(entryKey, parentKey);
    //   const stored = storedTranslationsMap?.[key];
    //   if (stored && stored.tag === 'grensesnitt') {
    //     return { nb: value, ...stored };
    //   }
    //   return { key, nb: value, tag: 'grensesnitt' };
    // });

    return {
      skjematekster: (formsApiState.data ?? []).filter((translation) => translation.tag === 'skjematekster'),
      grensesnitt: generateAndPopulateTag('grensesnitt', { ...common, ...grensesnitt }, storedTranslationsMap),
      'statiske-tekster': generateAndPopulateTag(
        'statiske-tekster',
        { ...statiske, pdfStatiske },
        storedTranslationsMap,
      ),
      validering: generateAndPopulateTag('validering', { validering }, storedTranslationsMap),
    };
  }, [formsApiState.data, storedTranslationsMap]);

  const value = { translationsPerTag, storedTranslations: storedTranslationsMap, saveTranslations };
  return <GlobalTranslationsContext.Provider value={value}>{children}</GlobalTranslationsContext.Provider>;
};

export const useGlobalTranslations = () => useContext(GlobalTranslationsContext);
export default GlobalTranslationsProvider;
