import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { getGlobalTranslationsWithLanguageAndTag, transformGlobalTranslationsToCsvData } from "./utils";

describe("getGlobalTranslationsWithLanguageAndTag", () => {
  it("should select the translation resource for the correct language and tag", () => {
    const actual = getGlobalTranslationsWithLanguageAndTag(
      {
        "nb-NO": [
          {
            id: 1,
            name: "global",
            scope: "global",
            tag: "skjematekster",
            translations: {
              "Originaltekst 1": {
                scope: "global",
                value: "Oversatt tekst 1 - nb-NO",
              },
            },
          },
          {
            id: 2,
            name: "global",
            scope: "global",
            tag: "validering",
            translations: {
              "Originaltekst 2": {
                scope: "global",
                value: "Oversatt tekst 2 - nb-NO",
              },
            },
          },
        ],
        "nn-NO": [
          {
            id: 3,
            name: "global",
            scope: "global",
            tag: "skjematekster",
            translations: {
              "Originaltekst 1": {
                scope: "global",
                value: "Oversatt tekst 1 - nn-NO",
              },
            },
          },
        ],
      },
      "nb-NO",
      "skjematekster"
    );
    expect(actual.id).toEqual(1);
    expect(actual.tag).toEqual("skjematekster");
  });

  it("adds missing original texts that have been added in other languages", () => {
    const actual = getGlobalTranslationsWithLanguageAndTag(
      {
        "nb-NO": [
          {
            id: 1,
            name: "global",
            scope: "global",
            tag: "skjematekster",
            translations: {
              "Originaltekst 1": {
                scope: "global",
                value: "Oversatt tekst 1 - nb-NO",
              },
            },
          },
        ],
        "nn-NO": [
          {
            id: 3,
            name: "global",
            scope: "global",
            tag: "skjematekster",
            translations: {
              "Originaltekst 2": {
                scope: "global",
                value: "Oversatt tekst 2 - nn-NO",
              },
            },
          },
        ],
      },
      "nb-NO",
      "skjematekster"
    );
    expect(actual.translations).toHaveProperty("Originaltekst 1");
    expect(actual.translations).toHaveProperty("Originaltekst 2");
  });

  it("should not add original texts from other tags", () => {
    const actual = getGlobalTranslationsWithLanguageAndTag(
      {
        "nb-NO": [
          {
            id: 1,
            name: "global",
            scope: "global",
            tag: "skjematekster",
            translations: {
              "Originaltekst 1": {
                scope: "global",
                value: "Oversatt tekst 1 - nb-NO",
              },
            },
          },
          {
            id: 2,
            name: "global",
            scope: "global",
            tag: "validering",
            translations: {
              "Originaltekst 2": {
                scope: "global",
                value: "Oversatt tekst 2 - nb-NO",
              },
            },
          },
        ],
        "nn-NO": [
          {
            id: 4,
            name: "global",
            scope: "global",
            tag: "validering",
            translations: {
              "Originaltekst 4": {
                scope: "global",
                value: "Oversatt tekst 4 - nn-NO",
              },
            },
          },
        ],
      },
      "nb-NO",
      "skjematekster"
    );
    expect(actual.translations).toHaveProperty("Originaltekst 1");
    expect(actual.translations).not.toHaveProperty("Originaltekst 2");
    expect(actual.translations).not.toHaveProperty("Originaltekst 4");
  });

  describe("transformGlobalTranslationsToCsvData", () => {
    const allPredefinedOriginalTexts = ["Forrige", "{{field}} kan ikke være senere enn {{maxYear}}"];
    const allGlobalTranslations = {
      en: [
        {
          tag: "skjematekster",
          translations: {
            Personopplysninger: { value: "Personal information", scope: "global" },
          },
        },
        {
          tag: "validering",
          translations: {
            "{{field}} kan ikke være senere enn {{maxYear}}": {
              value: "{{field}} cannot be later than {{maxYear}}",
              scope: "global",
            },
          },
        },
        {
          tag: "grensesnitt",
          translations: {
            Forrige: {
              value: "Previous",
              scope: "global",
            },
          },
        },
      ],
      "nn-NO": [
        {
          tag: "skjematekster",
          translations: {
            "{{field}} kan ikke være senere enn {{maxYear}}": {
              value: "{{field}} kan ikkje vere seinare enn {{maxYear}}",
              scope: "global",
            },
          },
        },
      ],
    };

    it("transforms global translations resource to csv data and headers", () => {
      const { data, headers } = transformGlobalTranslationsToCsvData(
        allGlobalTranslations,
        allPredefinedOriginalTexts,
        "en"
      );
      expect(data).toEqual([
        { text: "Personopplysninger", en: "Personal information" },
        { text: "{{field}} kan ikke være senere enn {{maxYear}}", en: "{{field}} cannot be later than {{maxYear}}" },
        { text: "Forrige", en: "Previous" },
      ]);
      expect(headers).toEqual([
        { key: "text", label: "Globale tekster" },
        { key: "en", label: "EN" },
      ]);
    });

    it("includes additional text added to another language even if translation is missing for current language", () => {
      const languageCode = "nn-NO";
      const { data, headers } = transformGlobalTranslationsToCsvData(
        allGlobalTranslations,
        allPredefinedOriginalTexts,
        languageCode
      );
      const translationEntry = data.find((entry) => entry.text === "Personopplysninger");
      expect(translationEntry).toBeDefined();
      expect(translationEntry?.[languageCode]).toBeUndefined();
      expect(headers).toEqual([
        { key: "text", label: "Globale tekster" },
        { key: "nn-NO", label: "NN-NO" },
      ]);
    });

    it("includes predefined text even if translation is missing for current language", () => {
      const languageCode = "nn-NO";
      const { data, headers } = transformGlobalTranslationsToCsvData(
        allGlobalTranslations,
        allPredefinedOriginalTexts,
        languageCode
      );
      const translationEntryPrevious = data.find((entry) => entry.text === TEXTS.grensesnitt.navigation.previous);
      expect(translationEntryPrevious).toBeDefined();
      expect(translationEntryPrevious?.[languageCode]).toBeUndefined();
      expect(headers).toEqual([
        { key: "text", label: "Globale tekster" },
        { key: "nn-NO", label: "NN-NO" },
      ]);
    });

    it("generates complete export for nynorsk", () => {
      const { data, headers } = transformGlobalTranslationsToCsvData(
        allGlobalTranslations,
        allPredefinedOriginalTexts,
        "nn-NO"
      );
      expect(data).toEqual([
        {
          text: "{{field}} kan ikke være senere enn {{maxYear}}",
          "nn-NO": "{{field}} kan ikkje vere seinare enn {{maxYear}}",
        },
        { text: "Personopplysninger", "nn-NO": undefined },
        { text: "Forrige", "nn-NO": undefined },
      ]);
      expect(headers).toEqual([
        { key: "text", label: "Globale tekster" },
        { key: "nn-NO", label: "NN-NO" },
      ]);
    });

    it("handles language with no global translations", () => {
      const { data, headers } = transformGlobalTranslationsToCsvData(
        allGlobalTranslations,
        allPredefinedOriginalTexts,
        "se"
      );
      expect(data).toEqual([
        { text: "Personopplysninger" },
        { text: "{{field}} kan ikke være senere enn {{maxYear}}" },
        { text: "Forrige" },
      ]);
      expect(headers).toEqual([
        { key: "text", label: "Globale tekster" },
        { key: "se", label: "SE" },
      ]);
    });
  });
});
