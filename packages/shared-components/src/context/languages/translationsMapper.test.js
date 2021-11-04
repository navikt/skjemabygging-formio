import {mapTranslationsToFormioI18nObject} from "./translationsMapper";

describe("translationsMapper", () => {

  it("konverterer oversettelser til i18n-struktur", () => {
    const translations = {
      "nn-NO": {
        "id": "61828d1945f11b000346b3f6", "translations": {
          "Side 1": {"value": "Side 1", "scope": "local"},
          "Personopplysninger": {"value": "Personopplysningar", "scope": "global"},
          "Antarktis": {"value": "Antarktis", "scope": "component-countryName"}
        }
      },
      "en": {
        "id": "6165717c00e3bc0003c9da66", "translations": {
          "Side 1": {"value": "Page 1", "scope": "local"},
          "Personopplysninger": {"value": "Personal information", "scope": "global"},
          "Antarktis": {"value": "Antarctica", "scope": "component-countryName"}
        }
      }
    };
    const i18n = mapTranslationsToFormioI18nObject(translations);
    expect(Object.keys(i18n)).toEqual(["nn-NO", "en"]);
    expect(i18n["en"]["Side 1"]).toBeDefined();
    expect(i18n["en"]["Personopplysninger"]).toBeDefined();
    expect(i18n["en"]["Antarktis"]).toBeDefined();
    expect(i18n["nn-NO"]["Side 1"]).toBeDefined();
    expect(i18n["nn-NO"]["Personopplysninger"]).toBeDefined();
    expect(i18n["nn-NO"]["Antarktis"]).toBeDefined();
  });

  it("filtrerer bort oversettelser med scope 'component-countryName'", () => {
    const translations = {
      "nn-NO": {
        "id": "61828d1945f11b000346b3f6", "translations": {
          "Side 1": {"value": "Side 1", "scope": "local"},
          "Personopplysninger": {"value": "Personopplysningar", "scope": "global"},
          "Antarktis": {"value": "Antarktis", "scope": "component-countryName"}
        }
      },
      "en": {
        "id": "6165717c00e3bc0003c9da66", "translations": {
          "Side 1": {"value": "Page 1", "scope": "local"},
          "Personopplysninger": {"value": "Personal information", "scope": "global"},
          "Antarktis": {"value": "Antarctica", "scope": "component-countryName"}
        }
      }
    };
    const countryNamesOnly = (translation) => translation.scope !== "component-countryName";
    const i18n = mapTranslationsToFormioI18nObject(translations, countryNamesOnly);
    expect(Object.keys(i18n)).toEqual(["nn-NO", "en"]);
    expect(i18n["en"]["Side 1"]).toBeDefined();
    expect(i18n["en"]["Personopplysninger"]).toBeDefined();
    expect(i18n["en"]["Antarktis"]).toBeUndefined();
    expect(i18n["nn-NO"]["Side 1"]).toBeDefined();
    expect(i18n["nn-NO"]["Personopplysninger"]).toBeDefined();
    expect(i18n["nn-NO"]["Antarktis"]).toBeUndefined();
  });

});
