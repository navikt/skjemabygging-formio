import { Enhet, Enhetstype } from "@navikt/skjemadigitalisering-shared-domain/types/enhet";

export const supportedEnhetstyper: Enhetstype[] = [
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

export const isEnhetSupported = (selectedEnhetstyper?: Enhetstype[]) => {
  const enhetsTyperToInclude =
    Array.isArray(selectedEnhetstyper) && selectedEnhetstyper.length > 0 ? selectedEnhetstyper : supportedEnhetstyper;

  return (enhet: Enhet) => enhetsTyperToInclude.includes(enhet.type) && enhet.enhetNr !== "0000";
};

export async function fetchEnhetsListe(baseUrl = ""): Promise<Enhet[]> {
  return fetch(`${baseUrl}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return [];
  });
}
