import { objectUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const { validering } = TEXTS;
const i18nData = {
  'nb-NO': {
    ...objectUtils.flatten(validering),
  },
  'nn-NO': {},
  en: {},
  pl: {},
};
export default i18nData;
