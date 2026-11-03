import { en, nb, nn } from '@navikt/ds-react/locales';

const getAkselLocale = (language: string) => (language.startsWith('en') ? en : language.startsWith('nn') ? nn : nb);

export { getAkselLocale };
