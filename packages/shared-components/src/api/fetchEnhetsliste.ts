import { Enhet, Enhetstype } from '@navikt/skjemadigitalisering-shared-domain';

const notEmptyArray = (arr) => Array.isArray(arr) && arr.length > 0;

export const isEnhetSupported = (selectedEnhetstyper: Enhetstype[]) => {
  return (enhet: Enhet) => (notEmptyArray(selectedEnhetstyper) ? selectedEnhetstyper.includes(enhet.type) : true);
};

export async function fetchEnhetsliste(baseUrl = ''): Promise<Enhet[]> {
  return fetch(`${baseUrl}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw Error('Failed to fetch enhetsliste');
  });
}
