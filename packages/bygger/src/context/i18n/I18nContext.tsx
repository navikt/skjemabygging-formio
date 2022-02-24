import { i18nData, mapTranslationsToFormioI18nObject } from "@navikt/skjemadigitalisering-shared-components";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { FormioTranslation, I18nTranslations, ScopedTranslationMap } from "../../../types/translations";
import { getFormTexts } from "../../translations/utils";

interface I18nState {
  translations: { [key: string]: FormioTranslation };
  translationsForNavForm: I18nTranslations;
  localTranslationsForNavForm: I18nTranslations;
}

type I18nAction =
  | { type: "init"; payload: I18nState }
  | { type: "update"; payload: { lang: string; translation: ScopedTranslationMap } };

function reducer(state: I18nState, action: I18nAction) {
  switch (action.type) {
    case "init":
      return {
        ...action.payload,
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

export const getAvailableLanguages = (state: I18nState) => Object.keys(state.translations);

const initialState: I18nState = {
  translations: {},
  translationsForNavForm: {},
  localTranslationsForNavForm: {},
};

const I18nDispatchContext = createContext<React.Dispatch<I18nAction>>(() => {});
const I18nStateContext = createContext(initialState);

const extractDefaultI18nNbNoFormTexts = (form) => {
  // i18n for nb-NO texts as a workaround to bug https://github.com/formio/formio.js/issues/4465
  return form ? getFormTexts(form).reduce((i18n, formText) => ({ ...i18n, [formText.text]: formText.text }), {}) : {};
};

function I18nStateProvider({ children, loadTranslations, form, forGlobal = false }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // todo: Clean up
  useEffect(() => {
    loadTranslations()
      .then((translations) => {
        const translationsAsI18n = mapTranslationsToFormioI18nObject(translations);
        const formTextsOnNbNOAsI18n = extractDefaultI18nNbNoFormTexts(form);
        dispatch({
          type: "init",
          payload: {
            translations,
            translationsForNavForm: {
              ...translationsAsI18n,
              "nb-NO": {
                ...translationsAsI18n["nb-NO"],
                ...i18nData["nb-NO"],
                ...formTextsOnNbNOAsI18n,
              },
            },
            localTranslationsForNavForm: mapTranslationsToFormioI18nObject(
              translations,
              (translation) => translation.scope !== "component-countryName" && translation.scope !== "global"
            ),
          },
        });
      })
      .catch((e) => {});
  }, [loadTranslations, form, forGlobal]);

  return (
    <I18nDispatchContext.Provider value={dispatch}>
      <I18nStateContext.Provider value={state}>{children}</I18nStateContext.Provider>
    </I18nDispatchContext.Provider>
  );
}

export const useI18nState = () => useContext(I18nStateContext);
export const useI18nDispatch = () => useContext(I18nDispatchContext);

export default I18nStateProvider;
