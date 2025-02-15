import { objectUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const { validering } = TEXTS;
const i18nData: object = {
  'nb-NO': {
    ...objectUtils.flatten(validering),
  },
  'nn-NO': {},
  en: {},
};
export default i18nData;
