import { i18nData, mapTranslationsToFormioI18nObject } from "@navikt/skjemadigitalisering-shared-components";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { FormioTranslationMap, I18nTranslations, ScopedTranslationMap } from "../../../types/translations";
import { getFormTexts } from "../../translations/utils";

interface I18nState {
  translations: FormioTranslationMap;
  translationsForNavForm: I18nTranslations;
  localTranslationsForNavForm: I18nTranslations;
}

type I18nAction =
  | { type: "init"; payload: FormioTranslationMap }
  | { type: "updateTranslationsForNavForm"; payload: I18nTranslations }
  | { type: "updateLocalTranslationsForNavForm"; payload: I18nTranslations }
  | { type: "update"; payload: { lang: string; translation: ScopedTranslationMap } };

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
          [action.payload["lang"]]: {
            translations: {
              ...state.translations[action.payload["lang"]].translations,
              ...action.payload.translation,
            },
          },
        },
      };
    default:
      return state;
  }
}

export const getAvailableLanguages = (translations: FormioTranslationMap) => Object.keys(translations);

const initialState: I18nState = {
  translations: {},
  translationsForNavForm: {},
  localTranslationsForNavForm: {},
};

const loadTranslationsAndInitState = async (loadTranslations, dispatch) => {
  const translations = await loadTranslations();
  dispatch({ type: "init", payload: translations });
};

const I18nDispatchContext = createContext<React.Dispatch<I18nAction>>(() => {});
const I18nStateContext = createContext(initialState);

const extractDefaultI18nNbNoFormTexts = (form) => {
  // i18n for nb-NO texts as a workaround to bug https://github.com/formio/formio.js/issues/4465
  return form ? getFormTexts(form).reduce((i18n, formText) => ({ ...i18n, [formText.text]: formText.text }), {}) : {};
};

function I18nStateProvider({ children, loadTranslations, form }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadTranslationsAndInitState(loadTranslations, dispatch);
  }, [loadTranslations, dispatch]);

  useEffect(() => {
    const translationsAsI18n = mapTranslationsToFormioI18nObject(state.translations);
    const formTextsForNbNOAsI18n = extractDefaultI18nNbNoFormTexts(form);
    const translationsForNavForm = {
      ...translationsAsI18n,
      "nb-NO": {
        ...translationsAsI18n["nb-NO"],
        ...i18nData["nb-NO"],
        ...formTextsForNbNOAsI18n,
      },
    };
    dispatch({ type: "updateTranslationsForNavForm", payload: translationsForNavForm });
  }, [state.translations, form, dispatch]);

  useEffect(() => {
    const localTranslationsForNavForm = mapTranslationsToFormioI18nObject(
      state.translations,
      (translation) => translation.scope !== "component-countryName" && translation.scope !== "global"
    );
    dispatch({ type: "updateLocalTranslationsForNavForm", payload: localTranslationsForNavForm });
  }, [state.translations, dispatch]);

  return (
    <I18nDispatchContext.Provider value={dispatch}>
      <I18nStateContext.Provider value={state}>{children}</I18nStateContext.Provider>
    </I18nDispatchContext.Provider>
  );
}

export const useI18nState = () => useContext(I18nStateContext);
export const useI18nDispatch = () => useContext(I18nDispatchContext);

export default I18nStateProvider;
