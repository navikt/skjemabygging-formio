import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const getNavBaseUrl = (url: string) => {
  if (url.includes('.dev.nav.')) {
    return url.includes('ansatt') ? 'https://www.ansatt.dev.nav.no' : 'https://www.intern.dev.nav.no';
  }

  return 'https://www.nav.no';
};

const getExitUrl = (url: string) => {
  return getNavBaseUrl(url);
};

const getMyPageUrl = (url: string) => {
  if (url.includes('.dev.nav.')) {
    return `${getNavBaseUrl(url)}/minside`;
  }

  return TEXTS.statiske.external.minSide.url;
};

export { getExitUrl, getMyPageUrl };
