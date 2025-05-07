const BASE_URL = 'https://www.nav.no';
export const PATHS = {
  BASE_URL: (locale: string) => (locale === 'en' ? `${BASE_URL}/${locale}` : `${BASE_URL}`),
  REPORT_BUG: (locale: string) => `${BASE_URL}/person/kontakt-oss/${locale}/tilbakemeldinger/feil-og-mangler`,
};
