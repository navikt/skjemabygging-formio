const BASE_URL = 'https://www.nav.no';
export const PATHS = {
  BASE_URL,
  REPORT_BUG: (locale: string) => `${BASE_URL}/person/kontakt-oss/${locale}/tilbakemeldinger/feil-og-mangler`,
  MY_PAGE: `${BASE_URL}/min-side`,
  CONTACT_US: `${BASE_URL}/kontakt-oss`,
};
