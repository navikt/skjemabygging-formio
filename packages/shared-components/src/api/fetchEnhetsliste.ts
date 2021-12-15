import { EnhetInkludertKontaktinformasjon, Enhetstype } from "./Enhet";

const enhetsTypeWithKontaktInfo: Enhetstype[] = [
  "AAREG",
  "ALS",
  "ARK",
  "DIR",
  "FPY",
  "FYLKE",
  "HMS",
  "INNKREV",
  "INTRO",
  "KLAGE",
  "KONTAKT",
  "KONTROLL",
  "LOKAL",
  "OKONOMI",
  "TILTAK",
  "YTA",
  "OPPFUTLAND",
  "DOKSENTER",
  "ROL",
];

const enhetstypeVisesPaaNav: Enhetstype[] = [
  "ALS",
  "ARK",
  "FPY",
  "FYLKE",
  "HMS",
  "INTRO",
  "KLAGE",
  "KO",
  "KONTROLL",
  "LOKAL",
  "OKONOMI",
  "TILTAK",
  "YTA",
  "OPPFUTLAND",
];

export const skalHaKontaktInfo = (enhet: EnhetInkludertKontaktinformasjon) => {
  return enhetsTypeWithKontaktInfo.includes(enhet.enhet.type);
};

export const skalVisesPaaNav = (enhet: EnhetInkludertKontaktinformasjon) => {
  return enhetstypeVisesPaaNav.includes(enhet.enhet.type);
};

export async function fetchEnhetsListe(baseUrl = "") {
  return fetch(`${baseUrl}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.resolve([]);
  });
}
