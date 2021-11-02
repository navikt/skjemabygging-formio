import React from "react";
import { getCompleteTranslationLanguageCodeList } from "./PublishSettingsModal";

describe("getCompleteTranslationLanguageCodeList", () => {
  it("return empty list when there is no form text and translation", () => {
    const actual = getCompleteTranslationLanguageCodeList([], {});
    expect(actual).toEqual([]);
  });

  it("return empty list when there are form text and but no translation", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge", "Ja", "Nei"], {});
    expect(actual).toEqual([]);
  });
  it("return empty list when there are form text and not complete translations", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge?", "Ja", "Nei"], {
      en: { "Bor du i Norge?": "Do you live in Norway?" },
      "nn-NO": { Ja: "Yes" },
    });
    expect(actual).toEqual([]);
  });
  it("return en when there are form text and complete English translations", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge?", "Ja", "Nei"], {
      en: { "Bor du i Norge?": "Do you live in Norway?", Ja: "Yes", Nei: "No" },
      "nn-NO": { Ja: "Ja" },
    });
    expect(actual).toEqual(["en"]);
  });

  it("return en and nn-NO when there are form text and complete English and Nynorsk translations", () => {
    const actual = getCompleteTranslationLanguageCodeList(["Bor du i Norge?", "Ja", "Nei"], {
      en: { "Bor du i Norge?": "Do you live in Norway?", Ja: "Yes", Nei: "No" },
      "nn-NO": { "Bor du i Norge?": "Bor du i Norge?", Ja: "Ja", Nei: "Nei", Takk: "Takk" },
    });
    expect(actual).toEqual(["en", "nn-NO"]);
  });
});
