import I18nStateProvider, { getAvailableLanguages, useI18nDispatch, useI18nState } from "./I18nContext";

const languagesInNorwegian = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};

export { useI18nState, useI18nDispatch, getAvailableLanguages, languagesInNorwegian };

export default I18nStateProvider;
