import { Enhet, Enhetstype } from "@navikt/skjemadigitalisering-shared-domain";

export const supportedEnhetstyper: Enhetstype[] = [
  "ALS",
  "ARK",
  "FPY",
  "FYLKE",
  "HMS",
  "INNKREV",
  "INTRO",
  "KLAGE",
  "KO",
  "KONTROLL",
  "LOKAL",
  "OKONOMI",
  "OPPFUTLAND",
  "ROL",
  "TILTAK",
  "UTLAND",
  "YTA",
];

export const isEnhetSupported = (selectedEnhetstyper?: Enhetstype[]) => {
  const enhetstyperToInclude =
    Array.isArray(selectedEnhetstyper) && selectedEnhetstyper.length > 0 ? selectedEnhetstyper : supportedEnhetstyper;

  return (enhet: Enhet) => enhetstyperToInclude.includes(enhet.type) && enhet.enhetNr !== "0000";
};

export async function fetchEnhetsliste(baseUrl = ""): Promise<Enhet[]> {
  return fetch(`${baseUrl}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return [];
  });
}
