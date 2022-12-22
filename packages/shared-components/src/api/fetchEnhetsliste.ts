import { Enhet, Enhetstype, supportedEnhetstyper } from "@navikt/skjemadigitalisering-shared-domain";

// TODO filtreringen er flyttet til Fyllut backend; bruk av "supportedEnhetstyper" samt sjekk på enhetNr "0000" skal fjernes fra denne filen.
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
    throw Error("Failed to fetch enhetsliste");
  });
}
