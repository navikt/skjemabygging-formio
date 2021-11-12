import { getGlobalTranslationsWithLanguageAndTag } from "./utils";

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
              "Originaltekst 3": {
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
    expect(actual.translations).toHaveProperty("Originaltekst 3");
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
});
