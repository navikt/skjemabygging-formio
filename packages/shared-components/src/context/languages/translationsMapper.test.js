import {mapTranslationsToFormioI18nObject} from "./translationsMapper";

describe("translationsMapper", () => {

  it("filters translations by given scope", () => {
    const translations = {
      "nn-NO": [{
        "id": "6166e450a223df0003b55011",
        "name": "global",
        "scope": "global",
        "tag": "grensesnitt",
        "translations": {"Ja": {"value": "Ja", "scope": "global"}, "Nei": {"value": "Nei", "scope": "global"}}
      }, {
        "id": "6165499e00e3bc0003c9da5c",
        "name": "global",
        "scope": "global",
        "tag": "skjematekster",
        "translations": {
          "Personopplysninger": {"value": "Personopplysningar", "scope": "global"},
          "Fødselsnummer / D-nummer": {"value": "Fødselsnummer / D-nummer", "scope": "global"},
          "Fornavn": {"value": "Fornamn", "scope": "global"},
          "Etternavn": {"value": "Etternamn", "scope": "global"},
          "Erklæring": {"value": "Erklæring", "scope": "global"},
          "Tilleggsopplysninger": {"value": "Tilleggsopplysningar", "scope": "global"},
          "Vedlegg": {"value": "Vedlegg", "scope": "global"},
          "Jeg legger det ved denne søknaden (anbefalt)": {
            "value": "Eg legg det ved denne søknaden (anbefalt).",
            "scope": "global"
          },
          "Annen dokumentasjon": {"value": "Annan dokumentasjon", "scope": "global"},
          "Ja, jeg legger det ved denne søknaden.": {"value": "Ja, eg legg det ved denne søknaden.", "scope": "global"},
          "Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.": {
            "value": "Nei, eg har ingen ekstra dokumentasjon eg vil leggje ved.",
            "scope": "global"
          },
          "Har du noen annen dokumentasjon du ønsker å legge ved?": {
            "value": "Har du annan dokumentasjon du ønskjer å leggje ved?",
            "scope": "global"
          }
        }
      }],
      "en": [{
        "id": "6166e42fa223df0003b5500f",
        "name": "global",
        "scope": "global",
        "tag": "statiske-tekster",
        "translations": {"Oppsummering": {"value": "Summary", "scope": "global"}}
      }, {
        "id": "615c34d2dcaf0a00038a06cf",
        "name": "global",
        "scope": "global",
        "tag": "skjematekster",
        "translations": {
          "Sverige": {"value": "Sweden", "scope": "global"},
          "Tastatur": {"value": "Keyboard", "scope": "global"},
          "Mobil": {"value": "Mobile", "scope": "global"},
          "Oss": {"value": "Us", "scope": "global"}
        }
      }, {
        "id": "615c0715dcaf0a00038a06ad",
        "name": "global",
        "scope": "global",
        "tag": "validering",
        "translations": {"Du må fylle ut: {{field}}": {"value": "You have to fill out: {{field}}", "scope": "global"}}
      }, {
        "id": "6159bf7ea460500003350fa6",
        "name": "global",
        "scope": "global",
        "tag": "grensesnitt",
        "translations": {
          "Last ned Søknad": {"value": "Download application", "scope": "global"},
          "Juli": {"value": "July", "scope": "global"}
        }
      }]
    };
    const countryNamesOnly = (translation) => translation.scope !== "component-countryName";
    const i18n = mapTranslationsToFormioI18nObject(translations, countryNamesOnly);
    console.log(i18n)
    expect(Object.keys(i18n)).toEqual(["nn-NO", "en"]);
  });

});
