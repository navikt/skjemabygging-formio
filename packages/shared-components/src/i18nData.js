import { TEXTS, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { validering, grensesnitt} = TEXTS;
const { navigation} = grensesnitt;
const i18nData = {
  "nb-NO": {
    ...objectUtils.flatten({ validering, navigation})
  },
  "nn-NO": {},
  en: {},
  pl: {},
};
export default i18nData;
