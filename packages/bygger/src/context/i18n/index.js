import I18nStateProvider, { getAvailableLanguages, useI18nDispatch, useI18nState } from './I18nContext';

const languagesInNorwegian = {
  'nn-NO': 'Norsk nynorsk',
  en: 'Engelsk',
  pl: 'Polsk',
};

export { getAvailableLanguages, languagesInNorwegian, useI18nDispatch, useI18nState };

export default I18nStateProvider;
