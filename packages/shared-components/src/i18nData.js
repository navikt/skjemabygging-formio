import { TEXTS, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { validering, grensesnitt, common, ...remainingTexts } = TEXTS;
const { navigation, ...remainingGrensesnittTexts } = grensesnitt;
const i18nData = {
  "nb-NO": {
    ...objectUtils.flatten({ validering, navigation, common }),
    ...objectUtils.flatten({ remainingGrensesnittTexts, remainingTexts }, true),
  },
  "nn-NO": {},
  en: {},
  pl: {},
};
export default i18nData;
