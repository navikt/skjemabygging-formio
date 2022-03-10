import { FormioTranslationMap, I18nTranslations, ScopedTranslationMap } from "../../../types/translations";

export interface I18nState {
  translations: FormioTranslationMap;
  translationsForNavForm: I18nTranslations;
  localTranslationsForNavForm: I18nTranslations;
}

export type I18nAction =
  | { type: "init"; payload: FormioTranslationMap }
  | { type: "updateTranslationsForNavForm"; payload: I18nTranslations }
  | { type: "updateLocalTranslationsForNavForm"; payload: I18nTranslations }
  | { type: "update"; payload: { lang: string; translation: ScopedTranslationMap } }
  | { type: "remove"; payload: { lang: string; key: string } };

function reducer(state: I18nState, action: I18nAction) {
  switch (action.type) {
    case "init":
      return {
        ...state,
        translations: action.payload,
      };
    case "updateTranslationsForNavForm":
      return {
        ...state,
        translationsForNavForm: action.payload,
      };
    case "updateLocalTranslationsForNavForm":
      return {
        ...state,
        localTranslationsForNavForm: action.payload,
      };
    case "update":
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.lang]: {
            ...state.translations[action.payload.lang],
            translations: {
              ...state.translations[action.payload.lang].translations,
              ...action.payload.translation,
            },
          },
        },
      };
    case "remove":
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.lang]: {
            ...state.translations[action.payload.lang],
            translations: Object.fromEntries(
              Object.entries(state.translations[action.payload.lang].translations).filter(
                ([key]) => key !== action.payload.key
              )
            ),
          },
        },
      };
    default:
      return state;
  }
}

export default reducer;
