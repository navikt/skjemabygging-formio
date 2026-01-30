import { Enhet, Enhetstype } from '@navikt/skjemadigitalisering-shared-domain';

const notEmptyArray = (arr) => Array.isArray(arr) && arr.length > 0;

const compareEnheter = (enhetA, enhetB) => enhetA.navn.localeCompare(enhetB.navn, 'nb');

const isEnhetSupported = (selectedEnhetstyper: Enhetstype[]) => {
  return (enhet: Enhet) => (notEmptyArray(selectedEnhetstyper) ? selectedEnhetstyper.includes(enhet.type) : true);
};

const fetchFilteredEnhetsliste = async (baseUrl: string = '', enhetstyper: Enhetstype[]) => {
  const list: Enhet[] = await fetchEnhetsliste(baseUrl);
  return list.filter(isEnhetSupported(enhetstyper)).sort(compareEnheter);
};

const fetchEnhetsliste = async (baseUrl = ''): Promise<Enhet[]> => {
  return fetch(`${baseUrl}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw Error('Failed to fetch enhetsliste');
  });
};

export { compareEnheter, fetchEnhetsliste, fetchFilteredEnhetsliste, isEnhetSupported };
