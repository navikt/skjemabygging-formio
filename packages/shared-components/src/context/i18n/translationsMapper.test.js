import { combineTranslationResources } from "./translationsMapper";

const mockTranslationBokmalLocal = {
  id: "bokmal-local",
  language: "nb-NO",
  scope: "local",
  i18n: {
    "tekst 1": "tekst 1",
    "tekst 2": "tekst 2",
  },
};

const mockTranslationNynorskLocal = {
  id: "nynorsk-local",
  language: "nn-NO",
  scope: "local",
  i18n: {
    "tekst 1": "første tekst 1",
    "tekst 2": "første tekst 2",
  },
};

const mockTranslationNynorskGlobal = {
  id: "nynorsk-global",
  language: "nn-NO",
  scope: "global",
  i18n: {
    "tekst 1": "andre tekst 1",
  },
};

const mockTranslationEnglishGlobal = {
  id: "english-global",
  language: "en",
  scope: "global",
  i18n: {
    "tekst 1": "text 1",
    "tekst 2": "text 2",
  },
};

const mockTranslationsResources = [
  mockTranslationBokmalLocal,
  mockTranslationNynorskGlobal,
  mockTranslationNynorskLocal,
  mockTranslationEnglishGlobal,
];

describe("translationsMapper", () => {
  it("combine translation resources correctly", () => {
    const actual = mockTranslationsResources.reduce(combineTranslationResources, {});
    expect(actual).toEqual({
      en: {
        id: undefined,
        translations: {
          "tekst 1": {
            scope: "global",
            value: "text 1",
          },
          "tekst 2": {
            scope: "global",
            value: "text 2",
          },
        },
      },
      "nb-NO": {
        id: "bokmal-local",
        translations: {
          "tekst 1": {
            scope: "local",
            value: "tekst 1",
          },
          "tekst 2": {
            scope: "local",
            value: "tekst 2",
          },
        },
      },
      "nn-NO": {
        id: "nynorsk-local",
        translations: {
          "tekst 1": {
            scope: "global",
            value: "andre tekst 1",
          },
          "tekst 2": {
            scope: "local",
            value: "første tekst 2",
          },
        },
      },
    });
  });
});
