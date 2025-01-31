import { i18nUtils, mapTranslationsToFormioI18nObject } from '@navikt/skjemadigitalisering-shared-components';
import { FormioTranslationMap, Language, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { getFormTexts } from '../../old_translations/utils';
import i18nReducer, { I18nAction, I18nState } from './i18nReducer';

export const getAvailableLanguages = (translations: FormioTranslationMap) => Object.keys(translations) as Language[];

interface I18nStateProviderProps {
  children: React.ReactElement;
  loadTranslations: () => Promise<FormioTranslationMap>;
  form?: NavFormType;
}

const initialState: I18nState = {
  status: 'LOADING',
  translations: {},
  translationsForNavForm: {},
  localTranslationsForNavForm: {},
};

const loadTranslationsAndInitState = async (
  loadTranslations: () => Promise<FormioTranslationMap>,
  dispatch: React.Dispatch<I18nAction>,
): Promise<void> => {
  try {
    const translations = await loadTranslations();
    dispatch({ type: 'init', payload: translations });
  } catch (_e) {
    dispatch({ type: 'error' });
  }
};

const I18nDispatchContext = createContext<React.Dispatch<I18nAction>>(() => {});
const I18nStateContext = createContext(initialState);

const extractDefaultI18nNbNoFormTexts = (form) => {
  // i18n for nb-NO texts as a workaround to bug https://github.com/formio/formio.js/issues/4465
  return form ? getFormTexts(form).reduce((i18n, formText) => ({ ...i18n, [formText.text]: formText.text }), {}) : {};
};

function I18nStateProvider({ children, loadTranslations, form }: I18nStateProviderProps) {
  const [state, dispatch] = useReducer(i18nReducer, initialState);

  useEffect(() => {
    loadTranslationsAndInitState(loadTranslations, dispatch).catch(() => {});
  }, [loadTranslations]);

  useEffect(() => {
    const translationsAsI18n = mapTranslationsToFormioI18nObject(state.translations);
    const formTextsForNbNOAsI18n = extractDefaultI18nNbNoFormTexts(form);
    const translationsForNavForm = {
      ...translationsAsI18n,
      'nb-NO': {
        ...translationsAsI18n['nb-NO'],
        ...i18nUtils.initialData['nb-NO'],
        ...formTextsForNbNOAsI18n,
      },
    };
    dispatch({ type: 'updateTranslationsForNavForm', payload: translationsForNavForm });
  }, [state.translations, form]);

  useEffect(() => {
    const localTranslationsForNavForm = mapTranslationsToFormioI18nObject(
      state.translations,
      (translation) => translation.scope !== 'component-countryName' && translation.scope !== 'global',
    );
    dispatch({ type: 'updateLocalTranslationsForNavForm', payload: localTranslationsForNavForm });
  }, [state.translations]);

  return (
    <I18nDispatchContext.Provider value={dispatch}>
      <I18nStateContext.Provider value={state}>{children}</I18nStateContext.Provider>
    </I18nDispatchContext.Provider>
  );
}

export const useI18nState = () => useContext(I18nStateContext);
export const useI18nDispatch = () => useContext(I18nDispatchContext);

export default I18nStateProvider;
