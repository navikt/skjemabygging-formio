import { FormioTranslationMap, I18nTranslations, ScopedTranslationMap } from "../../../types/translations";
import reducer, { I18nState } from "./i18nReducer";

const mockedTranslations: FormioTranslationMap = {
  "nn-NO": {
    id: "61828d1945f11b000346b3f6",
    translations: {
      Testskjema: { value: "Testskjema", scope: "local" },
      Fornavn: { value: "Førenamn", scope: "local" },
    },
  },
  en: {
    id: "6165717c00e3bc0003c9da66",
    translations: {
      Testskjema: { value: "Test form", scope: "local" },
      Fornavn: { value: "First name", scope: "local" },
      "Global oversettelse": { value: "Global oversettelse", scope: "global" },
      Norge: { value: "Norway", scope: "component-countryName" },
    },
  },
};

const mockedTranslationsForNavForm: I18nTranslations = {
  "nn-NO": {
    Testskjema: "Testskjema",
    Fornavn: "Førenamn",
  },
  en: {
    Testskjema: "Test form",
    Fornavn: "First name",
    "Global oversettelse": "Global oversettelse",
    Norge: "Norway",
  },
};

const mockedLocalTranslationsForNavForm: I18nTranslations = {
  "nn-NO": {
    Testskjema: "Testskjema",
    Fornavn: "Førenamn",
  },
  en: {
    Testskjema: "Test form",
    Fornavn: "First name",
  },
};

describe("i18nReducer", () => {
  describe("init state", () => {
    const initialState: I18nState = {
      translations: {},
      translationsForNavForm: {},
      localTranslationsForNavForm: {},
    };

    it("assigns payload to translations on action type 'init'", () => {
      expect(reducer(initialState, { type: "init", payload: mockedTranslations })).toEqual({
        ...initialState,
        translations: mockedTranslations,
      });
    });

    it("assigns payload to translationsForNavForm on action type 'updateTranslationsForNavForm'", () => {
      expect(
        reducer(initialState, { type: "updateTranslationsForNavForm", payload: mockedTranslationsForNavForm })
      ).toEqual({
        ...initialState,
        translationsForNavForm: mockedTranslationsForNavForm,
      });
    });

    it("assigns payload to localTranslationsForNavForm on action type 'updateLocalTranslationsForNavForm'", () => {
      expect(
        reducer(initialState, { type: "updateLocalTranslationsForNavForm", payload: mockedLocalTranslationsForNavForm })
      ).toEqual({
        ...initialState,
        localTranslationsForNavForm: mockedLocalTranslationsForNavForm,
      });
    });
  });

  describe("update", () => {
    const initialState: I18nState = {
      translations: mockedTranslations,
      translationsForNavForm: {},
      localTranslationsForNavForm: {},
    };
    it("adds a new translation to translations", () => {
      const newTranslation: ScopedTranslationMap = { Etternavn: { value: "Last name", scope: "local" } };
      const actualState = reducer(initialState, {
        type: "update",
        payload: { lang: "en", translation: newTranslation },
      });
      expect(actualState.translations["en"].translations["Etternavn"]).toEqual({ value: "Last name", scope: "local" });
    });

    it("edits a translation in translations", () => {
      const changedTranslation: ScopedTranslationMap = { Fornavn: { value: "new value for Fornavn", scope: "local" } };
      const actualState = reducer(initialState, {
        type: "update",
        payload: { lang: "en", translation: changedTranslation },
      });
      expect(actualState.translations["en"].translations["Fornavn"]).toEqual({
        value: "new value for Fornavn",
        scope: "local",
      });
    });
  });

  describe("remove", () => {
    const initialState: I18nState = {
      translations: mockedTranslations,
      translationsForNavForm: {},
      localTranslationsForNavForm: {},
    };
    it("removes translation from language", () => {
      expect(initialState.translations["nn-NO"].translations["Fornavn"]).toBeDefined();
      const actualState = reducer(initialState, { type: "remove", payload: { lang: "nn-NO", key: "Fornavn" } });
      expect(actualState.translations["nn-NO"].translations["Fornavn"]).toBeUndefined();
    });
  });
});
