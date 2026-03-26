import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const getUrlParam = (queryStr, name) => {
  const urlParams = new URLSearchParams(queryStr);
  const data = Object.fromEntries(urlParams);
  return data[name];
};

const DEV_ANSATT = 'https://www.ansatt.dev.nav.no';
const DEV_INTERN = 'https://www.intern.dev.nav.no';

const getExitUrl = (url: string) => {
  if (url.indexOf('.dev.nav.') > 0) {
    if (url.indexOf('ansatt') > 0) {
      return DEV_ANSATT;
    }
    return DEV_INTERN;
  }
  return 'https://www.nav.no';
};

const getMyPageUrl = (url: string) => {
  if (url.indexOf('.dev.nav.') > 0) {
    if (url.indexOf('ansatt') > 0) {
      return `${DEV_ANSATT}/minside`;
    }
    return `${DEV_INTERN}/minside`;
  }
  return TEXTS.statiske.external.minSide.url;
};

const url = {
  getUrlParam,
  getExitUrl,
  getMyPageUrl,
};

export default url;
