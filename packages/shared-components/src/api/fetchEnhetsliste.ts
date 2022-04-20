import { Enhet, Enhetstype } from "@navikt/skjemadigitalisering-shared-domain/types/enhet";

export const supportedEnhetsType: Enhetstype[] = [
  "ALS",
  "ARK",
  "FORVALTNING",
  "FPY",
  "HMS",
  "INNKREV",
  "INTRO",
  "KLAGE",
  "KO",
  "KONTROLL",
  "LOKAL",
  "OKONOMI",
  "OPPFUTLAND",
  "OTENESTE",
  "ROL",
  "TILTAK",
  "UTLAND",
  "YTA",
];

export const canEnhetstypeBeSelected = (enhet: Enhet) => {
  return supportedEnhetsType.includes(enhet.type) && enhet.enhetNr !== "0000";
};

export async function fetchEnhetsListe(baseUrl = ""): Promise<Enhet[]> {
  return fetch(`${baseUrl}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return [];
  });
}
